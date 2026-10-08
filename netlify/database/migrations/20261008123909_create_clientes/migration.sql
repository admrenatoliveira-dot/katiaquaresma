CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY,
	"codigo" integer NOT NULL UNIQUE,
	"nome" text NOT NULL,
	"cpf" text,
	"endereco" text,
	"bairro" text,
	"cep" text,
	"cidade" text,
	"uf" text,
	"fone" text,
	"email" text,
	"condicao" text,
	"local_evento" text,
	"vendedor" text,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
