$root = Split-Path -Parent $MyInvocation.MyCommand.Path

New-Item -ItemType Directory -Force "$root\FlutterApp\assets\data" | Out-Null
New-Item -ItemType Directory -Force "$root\FlutterApp\assets\images" | Out-Null

Copy-Item "$root\shared\data\*" "$root\FlutterApp\assets\data\" -Recurse -Force
Copy-Item "$root\shared\images\*" "$root\FlutterApp\assets\images\" -Recurse -Force

Write-Host "Shared data and images synced successfully."
