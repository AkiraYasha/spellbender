#include <string.h>
#include "quickjs.h"
#include "cutils.h"

const char *sb_bridge(const void *args);
int sb_interrupt_handler(JSRuntime *rt, void *opaque);

static JSValue sb_bridge_wrap(JSContext *ctx, JSValue this_val, int argc, JSValue *argv)
{
    const char *args_s, *result_s;
    JSValue args, result;

    args = JS_JSONStringify(ctx, argv[0], JS_UNDEFINED, JS_UNDEFINED);
    args_s = JS_ToCString(ctx, args);

    result_s = sb_bridge(args_s);
    result = JS_ParseJSON(ctx, result_s, strlen(result_s), "<bridge>");

    JS_FreeValue(ctx, args);
    JS_FreeCString(ctx, args_s);

    return result;
}

static JSCFunctionListEntry global_obj[] = {
    JS_CFUNC_DEF("$bridge", 0, sb_bridge_wrap),
};

static void js_dump_obj(JSContext *ctx, FILE *f, JSValue val)
{
    const char *str;

    str = JS_ToCString(ctx, val);
    if (str)
    {
        fprintf(f, "%s", str);
        JS_FreeCString(ctx, str);
    }
    else
    {
        fprintf(f, "[exception]\n");
    }
}

void SB_Init(JSRuntime *rt, JSContext *ctx)
{
    // Init interrupt handler
    JS_SetInterruptHandler(rt, sb_interrupt_handler, 0);

    // Init global object
    JSValue global = JS_GetGlobalObject(ctx);
    JS_SetPropertyFunctionList(ctx, global, global_obj, countof(global_obj));
    JS_FreeValue(ctx, global);
}

int SB_Eval(JSContext *ctx, const char *code_s, const char *filename_s)
{
    JSValue result = JS_Eval(ctx, code_s, strlen(code_s), filename_s, JS_EVAL_TYPE_GLOBAL);

    if (JS_IsException(result))
    {
        JSValue exception_val = JS_GetException(ctx);
        BOOL is_error = JS_IsError(ctx, exception_val);

        js_dump_obj(ctx, stderr, exception_val);
        if (is_error)
        {
            JSValue stack = JS_GetPropertyStr(ctx, exception_val, "stack");
            if (!JS_IsUndefined(stack))
            {
                js_dump_obj(ctx, stderr, stack);
            }
            JS_FreeValue(ctx, stack);

            JSValue cause = JS_GetPropertyStr(ctx, exception_val, "cause");
            if (!JS_IsUndefined(cause))
            {
                js_dump_obj(ctx, stderr, cause);
            }
            JS_FreeValue(ctx, cause);
        }
        JS_FreeValue(ctx, exception_val);
        JS_FreeValue(ctx, result);

        return FALSE;
    }
    else
    {
        JSValue json = JS_JSONStringify(ctx, result, JS_UNDEFINED, JS_UNDEFINED);
        const char *str = JS_ToCString(ctx, json);

        fprintf(stderr, "%s", str);

        JS_FreeCString(ctx, str);
        JS_FreeValue(ctx, json);
        JS_FreeValue(ctx, result);

        return TRUE;
    }
}
