import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const clientes = pgTable("clientes", {
  id: serial().primaryKey(),
  codigo: integer().notNull().unique(),
  nome: text().notNull(),
  cpf: text(),
  endereco: text(),
  bairro: text(),
  cep: text(),
  cidade: text(),
  uf: text(),
  fone: text(),
  email: text(),
  condicao: text(),
  localEvento: text("local_evento"),
  vendedor: text(),
  observacoes: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
