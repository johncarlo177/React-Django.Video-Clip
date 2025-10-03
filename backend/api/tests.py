import dropbox

dbx = dropbox.Dropbox(
    oauth2_refresh_token="a_1fxm1OJ94AAAAAAAAAAbLnl5wV9bsZQrGRG92f7vXUHPCQQaLLAWHiniyUspDE",
    app_key="5pbapurysmcn5tb",
    app_secret="ifixpymmez5wzut",
)

print(dbx.users_get_current_account())
