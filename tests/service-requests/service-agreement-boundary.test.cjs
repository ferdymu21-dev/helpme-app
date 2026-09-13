const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

const migrationPath =
  "database/forward-migrations/20260912_12_service_agreement_boundary.sql";

const migrationSource = fs.readFileSync(path.join(root, migrationPath), "utf8");

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractSqlFunction(functionName) {
  const start = migrationSource.indexOf(
    `create function public.${functionName}(`,
  );

  assert.ok(start >= 0, `SQL function not found: ${functionName}`);

  const bodyEnd = migrationSource.indexOf("$function$;", start);

  assert.ok(bodyEnd >= 0, `SQL function end not found: ${functionName}`);

  return migrationSource.slice(start, bodyEnd + "$function$;".length);
}

test("M12 is one atomic forward migration", () => {
  const beginMatches =
    migrationSource.replace(/^\uFEFF/, "").match(/^begin;$/gm) ?? [];

  const commitMatches = migrationSource.match(/^commit;$/gm) ?? [];

  assert.equal(beginMatches.length, 1);

  assert.equal(commitMatches.length, 1);

  assert.ok(migrationSource.trim().startsWith("begin;"));

  assert.ok(migrationSource.trim().endsWith("commit;"));
});

test("M12 exposes exactly the four Agreement boundary RPC definitions", () => {
  const definitions = [
    "propose_service_agreement",
    "get_my_service_request_agreements",
    "approve_service_agreement",
    "reject_service_agreement",
  ];

  for (const functionName of definitions) {
    const pattern = new RegExp(
      `create function public\\.${functionName}\\s*\\(`,
      "g",
    );

    const matches = migrationSource.match(pattern) ?? [];

    assert.equal(
      matches.length,
      1,
      `${functionName} must have exactly one definition`,
    );
  }
});

test("all M12 RPCs are security definer with an empty search path", () => {
  for (const functionName of [
    "propose_service_agreement",
    "get_my_service_request_agreements",
    "approve_service_agreement",
    "reject_service_agreement",
  ]) {
    const source = normalizeWhitespace(extractSqlFunction(functionName));

    assert.ok(
      source.includes("security definer set search_path to ''"),
      `${functionName} must use SECURITY DEFINER with an empty search_path`,
    );

    assert.ok(
      source.includes("public.require_current_service_actor();"),
      `${functionName} must derive the current actor authoritatively`,
    );
  }
});

test("Provider proposal identity and lifecycle state are derived from the locked Service Request", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("propose_service_agreement"),
  );

  assert.ok(source.includes("and sr.provider_id = v_provider_id for update"));

  assert.ok(source.includes("if v_request_status <> 'NEGOTIATING'"));

  assert.ok(source.includes("'PROPOSED', v_provider_id"));

  assert.ok(source.includes("status = 'AGREEMENT_PENDING'"));

  assert.ok(source.includes("and status = 'NEGOTIATING'"));
});

test("Provider proposal allocates Agreement version and predecessor inside the database", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("propose_service_agreement"),
  );

  assert.ok(source.includes("order by sa.version desc limit 1"));

  assert.ok(source.includes("if v_previous_status <> 'REJECTED'"));

  assert.ok(source.includes("v_next_version := v_previous_version + 1"));

  assert.ok(source.includes("v_previous_agreement_id := null"));

  assert.ok(source.includes("v_next_version := 1"));

  assert.ok(source.includes("v_next_version, v_previous_agreement_id"));
});

test("Agreement proposal never trusts browser-owned participants or lifecycle metadata", () => {
  const source = extractSqlFunction("propose_service_agreement");

  for (const forbidden of [
    "p_provider_id",
    "p_customer_id",
    "p_proposed_by",
    "p_version",
    "p_supersedes_agreement_id",
    "p_status",
    "p_prior_confirmed_amount",
    "auth.uid()",
  ]) {
    assert.ok(
      !source.includes(forbidden),
      `forbidden proposal authority found: ${forbidden}`,
    );
  }

  assert.match(source, /prior_confirmed_amount[\s\S]*0/);
});

test("Agreement proposal derives payment-step sequence from array order", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("propose_service_agreement"),
  );

  assert.ok(source.includes("with ordinality"));

  assert.ok(source.includes("step.ordinality::integer"));

  assert.ok(
    source.includes(
      "service_agreement_id, sequence_no, label, amount, trigger_type, trigger_note",
    ),
  );

  assert.ok(
    source.includes(
      "v_agreement_id, v_sequence_no, v_step_label, v_step_amount, v_step_trigger_type, v_step_trigger_note",
    ),
  );
});

test("Agreement proposal validates positive payment-step amounts and exact total", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("propose_service_agreement"),
  );

  assert.ok(source.includes("v_step_amount_numeric <= 0"));

  assert.ok(
    source.includes("trunc( v_step_amount_numeric ) <> v_step_amount_numeric"),
  );

  assert.ok(
    source.includes(
      "v_total_step_amount := v_total_step_amount + v_step_amount_numeric",
    ),
  );

  assert.ok(source.includes("v_total_step_amount <> p_total_price::numeric"));
});

test("Agreement proposal validates payment trigger types and CUSTOM notes", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("propose_service_agreement"),
  );

  for (const triggerType of [
    "UPFRONT",
    "BEFORE_START",
    "MILESTONE",
    "ON_SUBMISSION",
    "AFTER_COMPLETION",
    "CUSTOM",
  ]) {
    assert.ok(source.includes(`'${triggerType}'`));
  }

  assert.ok(
    source.includes(
      "v_step_trigger_type = 'CUSTOM' and v_step_trigger_note is null",
    ),
  );
});

test("participant Agreement history is readable only through the Request participants", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("get_my_service_request_agreements"),
  );

  assert.ok(
    source.includes(
      "sr.customer_id = v_actor_id or sr.provider_id = v_actor_id",
    ),
  );

  assert.ok(source.includes("order by sa.version desc"));

  assert.ok(source.includes("order by ps.sequence_no"));

  assert.doesNotMatch(source, /\bemail\b/i);

  assert.doesNotMatch(source, /\bphone\b/i);
});

test("Customer approval atomically moves PROPOSED and AGREEMENT_PENDING to APPROVED and AGREED", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("approve_service_agreement"),
  );

  assert.ok(source.includes("and sr.customer_id = v_customer_id for update"));

  assert.ok(source.includes("if v_request_status <> 'AGREEMENT_PENDING'"));

  assert.ok(source.includes("if v_agreement_status <> 'PROPOSED'"));

  assert.ok(source.includes("status = 'APPROVED', approved_at = v_now"));

  assert.ok(source.includes("status = 'AGREED', agreed_at = v_now"));

  assert.ok(source.includes("using errcode = '40001'"));
});

test("Customer rejection returns the Request to negotiation without destroying Agreement history", () => {
  const source = normalizeWhitespace(
    extractSqlFunction("reject_service_agreement"),
  );

  assert.ok(source.includes("and sr.customer_id = v_customer_id for update"));

  assert.ok(source.includes("if v_request_status <> 'AGREEMENT_PENDING'"));

  assert.ok(source.includes("if v_agreement_status <> 'PROPOSED'"));

  assert.ok(
    source.includes(
      "status = 'REJECTED', rejected_at = v_now, rejection_reason = v_reason",
    ),
  );

  assert.ok(source.includes("status = 'NEGOTIATING'"));

  assert.ok(source.includes("using errcode = '40001'"));
});

test("F10.F does not mutate an approved Agreement into SUPERSEDED", () => {
  for (const functionName of [
    "propose_service_agreement",
    "approve_service_agreement",
    "reject_service_agreement",
  ]) {
    const source = normalizeWhitespace(extractSqlFunction(functionName));

    assert.ok(!source.includes("status = 'SUPERSEDED'"));

    assert.ok(!source.includes("superseded_at ="));
  }
});

test("M12 grants Agreement RPC execution only through authenticated or service_role ACLs", () => {
  for (const functionName of [
    "propose_service_agreement",
    "get_my_service_request_agreements",
    "approve_service_agreement",
    "reject_service_agreement",
  ]) {
    const aclStart = migrationSource.indexOf(
      `on function public.${functionName}(`,
    );

    assert.ok(aclStart >= 0, `ACL not found: ${functionName}`);

    const tail = migrationSource.slice(aclStart);

    assert.match(
      tail,
      new RegExp(
        `on function public\\.${functionName}\\([\\s\\S]*?from public;`,
      ),
    );

    assert.match(
      tail,
      new RegExp(`on function public\\.${functionName}\\([\\s\\S]*?from anon;`),
    );

    assert.match(
      tail,
      new RegExp(
        `on function public\\.${functionName}\\([\\s\\S]*?to authenticated;`,
      ),
    );

    assert.match(
      tail,
      new RegExp(
        `on function public\\.${functionName}\\([\\s\\S]*?to service_role;`,
      ),
    );
  }
});

test("M12 introduces no raw table grants or browser policies for Agreement tables", () => {
  assert.doesNotMatch(
    migrationSource,
    /grant\s+.+\s+on\s+table\s+public\.service_agreements/i,
  );

  assert.doesNotMatch(
    migrationSource,
    /grant\s+.+\s+on\s+table\s+public\.service_agreement_payment_steps/i,
  );

  assert.doesNotMatch(
    migrationSource,
    /create\s+policy[\s\S]*service_agreements/i,
  );

  assert.doesNotMatch(
    migrationSource,
    /create\s+policy[\s\S]*service_agreement_payment_steps/i,
  );
});
