async function main(sqlPath: string) {
  const sql = await Deno.readTextFile(sqlPath);
  const generated = { createTable: sql };
  console.log(JSON.stringify(generated, undefined, 2));
}

await main(Deno.args[0]);
