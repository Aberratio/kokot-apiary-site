"""The honey jar as a glTF model for the Offer scene.

    blender -b --factory-startup -P blender/export_jar.py

Writes blender/build/jar.glb: three meshes named Glass, Honey and Lid, without
materials, because the scene assigns its own (src/components/jar/JarCanvas.tsx). The build
script then compresses it with gltfpack into public/models/jar.glb.
"""

import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import common  # noqa: E402
import geometry  # noqa: E402


def main():
    common.reset()
    parts = geometry.build_jar(with_label=False, for_export=True, segments=48)
    # The export profiles are coarse; one level of subdivision rounds the base, shoulder and
    # rim, and is applied so the model carries the smooth shape.
    for name in ("Glass", "Honey"):
        geometry.subdivide(parts[name], 1, 1)
    # A knurled lid edge that the export resolution can carry.
    bpy.data.objects.remove(parts["Lid"])
    geometry.lathe("Lid", geometry.LID_PROFILE, 96, radius_at=geometry.knurl(count=48, depth=0.006))
    out = os.path.join(common.BUILD, "jar.glb")
    os.makedirs(common.BUILD, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        export_apply=True,
        export_materials="NONE",
        export_texcoords=False,
        export_normals=True,
        export_yup=True,
    )
    print("exported", out)


main()
