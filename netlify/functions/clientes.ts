import type { Config, Context } from "@netlify/functions";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { clientes } from "../../db/schema.js";

const TEXT_FIELDS = [
  "nome",
  "cpf",
  "endereco",
  "bairro",
  "cep",
  "cidade",
  "uf",
  "fone",
  "email",
  "condicao",
  "localEvento",
  "vendedor",
  "observacoes",
] as const;

// Normaliza os campos recebidos: a planilha usa 0 e "xxxxxxxxxx" como "sem informação".
function clean(input: Record<string, unknown>): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const f of TEXT_FIELDS) {
    if (!(f in input)) continue;
    const v = input[f];
    if (v === null || v === undefined || v === 0 || v === "0") {
      out[f] = null;
      continue;
    }
    const s = String(v).trim();
    out[f] = s === "" || /^x+$/i.test(s) ? null : s;
  }
  if (out.uf) out.uf = out.uf.toUpperCase().slice(0, 2);
  return out;
}

const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

async function nextCodigo() {
  const [row] = await db.select({ max: sql<number>`coalesce(max(${clientes.codigo}), 0)` }).from(clientes);
  return Number(row.max) + 1;
}

export default async (req: Request, context: Context) => {
  const { id } = context.params;

  try {
    if (id === "importar") {
      if (req.method !== "POST") return bad("Método não permitido", 405);
      const body = await req.json();
      if (!Array.isArray(body)) return bad("Envie uma lista de clientes");
      const rows = body
        .map((c) => ({ ...clean(c), codigo: Number(c.codigo) }) as Record<string, unknown> & { codigo: number })
        .filter((c) => c.nome && Number.isInteger(c.codigo) && c.codigo > 0) as (typeof clientes.$inferInsert)[];
      if (rows.length) await db.insert(clientes).values(rows).onConflictDoNothing({ target: clientes.codigo });
      return Response.json({ importados: rows.length });
    }

    if (!id) {
      if (req.method === "GET") {
        return Response.json(await db.select().from(clientes).orderBy(asc(clientes.codigo)));
      }
      if (req.method === "POST") {
        const data = clean(await req.json());
        if (!data.nome) return bad("Informe o nome do cliente");
        const [created] = await db
          .insert(clientes)
          .values({ ...data, nome: data.nome, codigo: await nextCodigo() })
          .returning();
        return Response.json(created, { status: 201 });
      }
      return bad("Método não permitido", 405);
    }

    const clienteId = Number(id);
    if (!Number.isInteger(clienteId)) return bad("Cliente inválido");

    if (req.method === "PUT") {
      const data = clean(await req.json());
      if ("nome" in data && !data.nome) return bad("Informe o nome do cliente");
      const [updated] = await db
        .update(clientes)
        .set({ ...data, nome: data.nome ?? undefined, updatedAt: new Date() })
        .where(eq(clientes.id, clienteId))
        .returning();
      return updated ? Response.json(updated) : bad("Cliente não encontrado", 404);
    }

    if (req.method === "DELETE") {
      const [deleted] = await db.delete(clientes).where(eq(clientes.id, clienteId)).returning();
      return deleted ? new Response(null, { status: 204 }) : bad("Cliente não encontrado", 404);
    }

    return bad("Método não permitido", 405);
  } catch (err) {
    console.error(err);
    return bad("Erro ao acessar o banco de dados", 500);
  }
};

export const config: Config = {
  path: ["/api/clientes", "/api/clientes/:id"],
};
