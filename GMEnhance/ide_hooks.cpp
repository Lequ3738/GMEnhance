#include "pch.h"
#include "ide_hooks.h"
#include "code_hint.h"
#include "completion.h"
#include "middle_click.h"
#include "dpi_aware.h"
#include "settings.h"
#include "gm_log.h"

bool ide_hooks_install(HMODULE gm_base)
{
    enh_settings_load();
    bool ok = true;
    if (g_enh.code_hint)
        ok = code_hint_install(gm_base) && ok;
    else
        gm_log("GMEnhance: code_hint disabled by ini, skipped");
    if (g_enh.completion)
        ok = completion_install(gm_base) && ok;
    else
        gm_log("GMEnhance: completion disabled by ini, skipped");
    if (g_enh.middle_click)
        ok = middle_click_install(gm_base) && ok;
    else
        gm_log("GMEnhance: middle_click disabled by ini, skipped");
    if (g_enh.dpi)
        ok = dpi_aware_install(gm_base) && ok;
    else
        gm_log("GMEnhance: dpi disabled by ini, skipped");
    return ok;
}

void ide_hooks_uninstall()
{
    code_hint_uninstall();
    completion_uninstall();
    middle_click_uninstall();
    dpi_aware_uninstall();
}
