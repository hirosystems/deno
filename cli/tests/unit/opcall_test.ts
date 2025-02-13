import {
  assert,
  assertStringIncludes,
  unitTest,
  unreachable,
} from "./test_util.ts";

unitTest(async function sendAsyncStackTrace() {
  const buf = new Uint8Array(10);
  const rid = 10;
  try {
    await Deno.read(rid, buf);
    unreachable();
  } catch (error) {
    const s = error.stack.toString();
    console.log(s);
    assertStringIncludes(s, "opcall_test.ts");
    assertStringIncludes(s, "read");
    assert(
      !s.includes("deno:core"),
      "opcall stack traces should NOT include deno:core internals such as unwrapOpResult",
    );
  }
});

declare global {
  namespace Deno {
    // deno-lint-ignore no-explicit-any
    var core: any;
  }
}

unitTest(async function opsAsyncBadResource() {
  try {
    const nonExistingRid = 9999;
    await Deno.core.opAsync(
      "op_read_async",
      nonExistingRid,
      new Uint8Array(0),
    );
  } catch (e) {
    if (!(e instanceof Deno.errors.BadResource)) {
      throw e;
    }
  }
});

unitTest(function opsSyncBadResource() {
  try {
    const nonExistingRid = 9999;
    Deno.core.opSync("op_read_sync", nonExistingRid, new Uint8Array(0));
  } catch (e) {
    if (!(e instanceof Deno.errors.BadResource)) {
      throw e;
    }
  }
});
