{
  description = "Flake for Ollama Omni OCR";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixos-unstable/nixexprs.tar.xz";
  };

  outputs =
    inputs:
    let
      inherit (inputs.nixpkgs) lib;
      inherit (inputs.self.lib) pkgs';
      exposedSystems = lib.systems.flakeExposed;
      forExposedSystems = f: builtins.foldl' lib.recursiveUpdate { } (map f exposedSystems);
    in
    {
      lib.pkgs' =
        {
          nixpkgsInstance ? inputs.nixpkgs,
          config ? { },
          overlays ? [ ],
          system,
        }:
        import nixpkgsInstance { inherit config overlays system; };
    }
    // forExposedSystems (
      system: with (pkgs' { inherit system; }); {
        devShells."${system}" = {
          default = mkShell rec {
            packages = [
              dbus
              glibcLocales
              glibc
              gcc.cc.lib
              coreutils
              less
              shadow
              su
              gawk
              diffutils
              findutils
              gnused
              gnugrep
              gnutar
              gzip
              bzip2
              xz
              udev
              zlib
              zstd
            ]
            ++ [
              nodejs
              npm-check-updates
            ];
            shellHook = ''
              export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath packages}:$LD_LIBRARY_PATH
            '';
          };
        };
        formatter."${system}" = nixfmt-tree;
        legacyPackages."${system}" = { };
      }
    );

}
