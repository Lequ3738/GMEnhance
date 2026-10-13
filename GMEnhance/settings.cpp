#include "pch.h"
#include "settings.h"
#include "gm_log.h"

EnhSettings g_enh = { true, true, true, true };

extern "C" const IMAGE_DOS_HEADER __ImageBase;

// __ImageBase identifies this DLL regardless of the exe's location.
static void ini_path(char* path, size_t cch)
{
    GetModuleFileNameA((HMODULE)&__ImageBase, path, (DWORD)cch);
    char* s = strrchr(path, '\\');
    if (s) *(s + 1) = '\0';
    strcat_s(path, cch, "GMEnhance.ini");
}

void enh_settings_load()
{
    char path[MAX_PATH];
    ini_path(path, MAX_PATH);
    if (GetFileAttributesA(path) == INVALID_FILE_ATTRIBUTES)
    {
        gm_log("GMEnhance settings: no %s, all features on", path);
        return;
    }
    g_enh.code_hint = GetPrivateProfileIntA("GMEnhance", "code_hint", 1, path) != 0;
    g_enh.completion = GetPrivateProfileIntA("GMEnhance", "completion", 1, path) != 0;
    g_enh.middle_click = GetPrivateProfileIntA("GMEnhance", "middle_click", 1, path) != 0;
    g_enh.dpi = GetPrivateProfileIntA("GMEnhance", "dpi", 1, path) != 0;
    gm_log("GMEnhance settings: code_hint=%d completion=%d middle_click=%d dpi=%d",
        (int)g_enh.code_hint, (int)g_enh.completion, (int)g_enh.middle_click, (int)g_enh.dpi);
}
