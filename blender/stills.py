"""Rendered stills, lit like the hero: warm backlight, dark background, bokeh.

    blender -b --factory-startup -P blender/stills.py -- <shot> [--size WxH] [--samples N] [--out file.png]

Writes blender/build/<shot>.png. scripts/build-assets.mts renders every shot at the size in
src/lib/stills.ts and turns the PNGs into the AVIF and WebP files the site serves. Shots: see SHOTS at the bottom.
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import common  # noqa: E402
import geometry  # noqa: E402

# Honey colours per product: acacia is pale, linden greener gold, wildflower deep amber.
HONEYS = {
    "acacia": ("#fff2a0", "#8a4a06", 1.2),
    "linden": ("#fbe07a", "#5e3a05", 1.4),
    "wildflower": ("#f5b445", "#4a1a02", 1.6),
}


def jar_scene(honey="acacia", label=False, camera_offset=(0, 0), lens=70, glow=True):
    color, deep, density = HONEYS[honey]
    common.world(strength=0.6)
    jar = geometry.build_jar(color, deep, density, with_label=label)
    jar["Glass"].rotation_euler.z = math.radians(8)
    common.floor(z=-1.2)
    common.backlight_rig(scale=1.6, sun_energy=700, rim_energy=180)
    if glow:
        common.sun_glow_card((0.7, 3.2, 1.3), (0, -10, 0), 2.6, strength=4.0, falloff=2.6, color="#ffb347")
    common.bokeh(26, center=(0.5, 14.0, 1.5), spread=(8.0, 2.0, 4.5), radius=0.12, strength=6.0)
    ox, oz = camera_offset
    common.camera((0.0 + ox, -7.6, 0.55 + oz), (0, 0, -0.05 + oz * 0.3), lens=lens, fstop=0.25)


def jar_with_dipper():
    jar_scene("wildflower", label=False, lens=55, camera_offset=(0.4, 0.2))
    # An open jar: the honey runs off the dipper into it.
    bpy.data.objects.remove(bpy.data.objects["Lid"])
    dipper = geometry.build_dipper(length=3.4)
    for obj in dipper:
        obj.location = (0.3, -0.1, 1.85)
        obj.rotation_euler = (0, math.radians(90 + 28), math.radians(-25))
    geometry.drip((0.12, -0.15, 1.55), 1.0, radius=0.05)


def place(parts, location):
    for obj in parts:
        obj.location.x += location[0]
        obj.location.y += location[1]
        obj.location.z += location[2]


# Where the hero's drip leaves the dipper, and the honey level of the open jar below it.
DRIP_START = (-0.13, -0.1, 1.6)
HONEY_SURFACE = geometry.HONEY_LEVEL


def hero_scene(tall=False):
    """The product line on a dark table against the low sun: an open jar of wildflower honey
    with the dipper above it, linden and acacia behind. Wide frames keep the left half dark
    for the title; tall frames keep the lower part dark."""
    common.world(strength=0.5)
    common.floor(z=-1.2)

    front = geometry.build_jar(*HONEYS["wildflower"], with_label=True)
    bpy.data.objects.remove(front.pop("Lid"))
    middle = geometry.build_jar(*HONEYS["linden"], with_label=True)
    back = geometry.build_jar(*HONEYS["acacia"], with_label=True)
    place(front.values(), (0.0, 0.0, 0.0))
    place(middle.values(), (1.55, 1.5, 0.0))
    place(back.values(), (-1.35, 2.6, 0.0))
    for parts, turn in ((front, 6), (middle, -14), (back, 18)):
        for obj in parts.values():
            obj.rotation_euler.z = math.radians(turn)

    dipper = geometry.build_dipper(length=3.4)
    for obj in dipper:
        obj.location = (0.05, -0.05, 1.9)
        obj.rotation_euler = (0, math.radians(90 + 28), math.radians(-25))
    # The still shows the drop well formed; the hero's drip loop animates the whole cycle.
    geometry.drip_cycle(DRIP_START, 0.6, HONEY_SURFACE)

    common.backlight_rig(target=(0.2, 1.0, 0.0), scale=2.0, sun_energy=520, rim_energy=150)
    common.sun_glow_card((1.2, 7.0, 1.8), (0, -10, 0), 4.0, strength=4.0, falloff=2.6,
                         color="#ffb347")
    # The fill and the rim would show up as hot spots on the glossy table where the text goes.
    bpy.data.objects["Fill"].visible_glossy = False
    bpy.data.objects["Rim"].visible_glossy = False
    common.bokeh(18, center=(2.0, 16.0, 2.2), spread=(9.0, 2.0, 4.0), radius=0.16, strength=3.5)

    if tall:
        # Subject in the upper part of the frame, the dark table below it for the text.
        common.camera((0.1, -10.5, 1.1), (0.15, 0.6, -1.2), lens=50, fstop=0.5,
                      focus=(0.0, 0.0, 0.3))
    else:
        # Subject right of centre, the dark backdrop to the left for the title.
        common.camera((-2.7, -10.2, 1.0), (-2.1, 0.8, -0.05), lens=40, fstop=0.45,
                      focus=(0.0, 0.0, 0.3))


def comb_scene(frame=True, angle=-36, lens=60, distance=4.8, tilt=6.0):
    """Comb seen at a slant, raked by the low sun from the upper right so every cell wall
    catches a highlight, with depth of field taking the far side into soft glow."""
    common.world(strength=0.4)
    comb = geometry.build_comb(width=4.0, height=2.6)
    parts = list(comb)
    if frame:
        parts += geometry.build_frame(width=4.0, height=2.6)
    pivot = bpy.data.objects.new("Pivot", None)
    bpy.context.collection.objects.link(pivot)
    for obj in parts:
        obj.parent = pivot
    pivot.rotation_euler = (math.radians(90 + tilt), 0, math.radians(angle))
    # A low, warm sun grazing across the face of the comb, and a dim rim from behind.
    common.area_light("Back", (1.5, 5.0, 1.8), (0, 0, 0), 4.0, 420.0)
    common.area_light("Rake", (3.0, -1.6, 3.6), (0, 0, 0), 2.0, 1400.0)
    common.area_light("Rim", (-2.0, 3.0, 1.5), (0, 0, 0), 2.0, 160.0, color="#ffd9a0")
    common.area_light("Fill", (0.5, -4.0, 0.4), (0, 0, 0), 3.0, 10.0, color="#ffb46a")
    common.sun_glow_card((2.8, 6.0, 2.2), (0, -10, 0), 2.8, strength=5.0, falloff=2.4,
                         color="#ffb347")
    common.bokeh(30, center=(0, 11.0, 0.5), spread=(8.0, 2.0, 4.0), radius=0.14, strength=5.0)
    common.camera((0.6, -distance, 0.35), (0.1, 0, 0), lens=lens, fstop=0.7, focus=(0.1, 0, 0.1))


def hive_scene():
    """A stack of hive boxes against the low sun: mostly silhouette, with a warm rim."""
    common.world(strength=0.3)
    hive = geometry.build_hive()
    for obj in hive:
        obj.location.x += 0.3
    common.floor(z=0.0, color="#030201", roughness=0.9, specular=0.0)
    common.area_light("Sun", (3.0, 4.5, 3.6), (0.3, 0, 1.3), 2.5, 2600.0)
    common.area_light("Rim", (-3.0, 3.5, 2.5), (0.3, 0, 1.3), 2.0, 900.0, color="#ffd9a0")
    common.area_light("Fill", (-1.5, -6.0, 1.2), (0.3, 0, 1.3), 4.0, 120.0, color="#ffb46a")
    common.sun_glow_card((2.4, 9.0, 3.6), (0, -10, 1), 4.2, strength=6.0, falloff=2.2,
                         color="#ffb347")
    common.bokeh(40, center=(0, 16.0, 2.5), spread=(12.0, 3.0, 4.0), radius=0.2, strength=5.0)
    common.camera((-1.6, -7.0, 0.7), (0.3, 0, 1.4), lens=50, fstop=0.6)


SHOTS = {
    # name: (builder, default size)
    # Default sizes match src/lib/stills.ts, so a direct run renders what the pipeline does.
    "jar": (lambda: jar_scene("acacia"), (1200, 1500)),
    "product-acacia": (lambda: jar_scene("acacia"), (1000, 1000)),
    "product-linden": (lambda: jar_scene("linden"), (1000, 1000)),
    "product-wildflower": (lambda: jar_scene("wildflower"), (1000, 1000)),
    "about-comb": (lambda: comb_scene(), (1000, 1250)),
    "about-dipper": (jar_with_dipper, (1000, 1250)),
    "about-hive": (hive_scene, (1000, 1250)),
    "process-comb": (lambda: comb_scene(frame=False, angle=-30, lens=60, distance=4.6), (1400, 1400)),
    "hero-wide": (lambda: hero_scene(tall=False), (2560, 1440)),
    "hero-tall": (lambda: hero_scene(tall=True), (1080, 1620)),
}


def drip_region(width, height, pad=0.32):
    """The part of the frame the drip moves in, in whole pixels from the top left, with room
    around it for the site to feather the loop into the still. Sizes are even, for video."""
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector

    scene = bpy.context.scene
    # The camera was just aimed; its world matrix is only current after an update.
    bpy.context.view_layer.update()
    x, y, z = DRIP_START
    corners = [
        world_to_camera_view(scene, scene.camera, Vector((x + dx, y, zz)))
        for dx in (-pad, pad)
        for zz in (z + 0.15, HONEY_SURFACE - 0.25)
    ]
    left = min(c.x for c in corners) * width
    right = max(c.x for c in corners) * width
    top = (1 - max(c.y for c in corners)) * height
    bottom = (1 - min(c.y for c in corners)) * height
    even = lambda v: int(v) // 2 * 2  # noqa: E731
    left, top = even(left), even(top)
    w, h = even(right - left + 2), even(bottom - top + 2)
    return {"width": width, "height": height, "x": left, "y": top, "w": w, "h": h}


def render_drip_frames(shot, frames, width, height, out_dir):
    """Renders one drip cycle as PNG frames of the drip's region only, plus region.json."""
    import json

    region = drip_region(width, height)
    scene = bpy.context.scene
    scene.render.use_border = True
    scene.render.use_crop_to_border = True
    scene.render.border_min_x = region["x"] / width
    scene.render.border_max_x = (region["x"] + region["w"]) / width
    scene.render.border_max_y = 1 - region["y"] / height
    scene.render.border_min_y = 1 - (region["y"] + region["h"]) / height
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "region.json"), "w", encoding="utf8") as f:
        json.dump(region, f)
    for i in range(frames):
        for obj in [o for o in bpy.data.objects if o.name.startswith(("Drip", "FallingDrop"))]:
            bpy.data.objects.remove(obj)
        geometry.drip_cycle(DRIP_START, i / frames, HONEY_SURFACE)
        common.render(os.path.join(out_dir, f"{i:03d}.png"))


def main():
    argv = common.args()
    shot = argv[0]
    width, height = SHOTS[shot][1]
    samples = 192
    if "--size" in argv:
        width, height = (int(v) for v in argv[argv.index("--size") + 1].split("x"))
    if "--samples" in argv:
        samples = int(argv[argv.index("--samples") + 1])
    out = argv[argv.index("--out") + 1] if "--out" in argv else os.path.join(common.BUILD, f"{shot}.png")
    common.reset()
    common.render_settings(width, height, samples)
    SHOTS[shot][0]()
    if "--drip-frames" in argv:
        frames = int(argv[argv.index("--drip-frames") + 1])
        out_dir = os.path.join(common.BUILD, f"{shot}-drip")
        render_drip_frames(shot, frames, width, height, out_dir)
        return
    common.render(out)


main()
