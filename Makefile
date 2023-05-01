MAIN:=src/main.ts
MAIN_PERMISSIONS:=--allow-read --allow-write --allow-net --allow-env
DENO_ARGS:=${MAIN_PERMISSIONS} ${MAIN}
CONFIG:=./src/example.toml

build:
	deno run --allow-read --allow-write ./script/generate_sql/main.ts ./src/db/table.sql > ./src/db/gen_sql.json

test: build
	deno test ${MAIN_PERMISSIONS}

check:
	deno fmt --check
	deno check ${MAIN} ./src/test/* ./src/*_test.ts
	deno lint

cache:
	deno cache --reload --lock=deno.lock ${MAIN}

start: build
	deno run ${DENO_ARGS} start --config=${CONFIG}
room_list: build
	deno run ${DENO_ARGS} room list
room_history: build
	deno run ${DENO_ARGS} room history --key=test
help:
	deno run ${DENO_ARGS} --help
