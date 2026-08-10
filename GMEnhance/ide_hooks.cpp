#include "pch.h"
#include "ide_hooks.h"
#include "code_hint.h"
#include "completion.h"
#include "middle_click.h"

bool ide_hooks_install(HMODULE gm_base)
{
    bool ok = code_hint_install(gm_base);
    ok = completion_install(gm_base) && ok;
    ok = middle_click_install(gm_base) && ok;
    return ok;
}

void ide_hooks_uninstall()
{
    code_hint_uninstall();
    completion_uninstall();
    middle_click_uninstall();
}
