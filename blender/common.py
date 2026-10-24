"""Shared scene setup for the site's Blender assets.

Every asset is built from these scripts, headless:

    blender -b --factory-startup -P blender/<script>.py -- [options]

The look follows the hero: a dark warm backdrop, a sun glow from the upper right that backlights
the subject, out-of-focus bokeh behind it, amber honey and walnut wood. The colours are the
site's (src/app/globals.css).
"""

import math
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "blender", "build")

# The hero's palette, sRGB.
HONEY = "#f6a91f"
HONEY_DEEP = "#6e2a03"
WOOD = "#9a6634"
SUN = "#ffc164"
BACKDROP = "#0c0703"


def args():
    """Arguments after `--` on the Blender command line."""
    return sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []


def linear(hex_color, alpha=1.0):
    """An sRGB hex colour as a linear RGBA tuple, which is what Blender's sockets take."""
    value = hex_color.lstrip("#")
    channels = [int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)]

    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (*[to_linear(c) for c in channels], alpha)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def render_settings(width, height, samples=192, transparent=False):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 16
    scene.cycles.transmission_bounces = 16
    scene.cycles.transparent_max_bounces = 16
    # Fixed seed: a re-render of unchanged sources gives the same image.
    scene.cycles.seed = 7
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = transparent
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "Khronos PBR Neutral"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0


def world(color=BACKDROP, strength=1.0):
    w = bpy.data.worlds.new("Backdrop")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = linear(color)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w
    return w


def principled(name, **inputs):
    """A Principled BSDF material; keyword names are socket names with spaces as underscores."""
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes["Principled BSDF"]
    for key, value in inputs.items():
        bsdf.inputs[key.replace("_", " ")].default_value = value
    return material


def honey_material(color=HONEY, deep=HONEY_DEEP, density=1.0):
    """Clear amber honey: a glassy surface over a volume that absorbs the blue end of the light.

    Absorption keeps `color` and takes away its complement, more with depth, so thin honey
    shines `color` and thick honey turns towards `deep`, which tints the surface reflections.
    """
    material = principled(
        "Honey",
        Base_Color=linear("#fff1d6"),
        Roughness=0.03,
        IOR=1.49,
        Transmission_Weight=1.0,
        Specular_Tint=linear(deep),
    )
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    absorb = nodes.new("ShaderNodeVolumeAbsorption")
    absorb.inputs["Color"].default_value = linear(color)
    absorb.inputs["Density"].default_value = density
    links.new(absorb.outputs[0], nodes["Material Output"].inputs["Volume"])
    return material
def glass_material():
    return principled(
        "Glass",
        Base_Color=(1, 1, 1, 1),
        Roughness=0.015,
        IOR=1.5,
        Transmission_Weight=1.0,
    )


def metal_material(color="#c9a227", roughness=0.28):
    return principled("Lid", Base_Color=linear(color), Metallic=1.0, Roughness=roughness)


def wood_material(color=WOOD, dark="#4a2a12", scale=6.0, roughness=0.55):
    """Walnut: a stretched wave texture for the grain, mixed between two browns."""
    material = principled("Walnut", Roughness=roughness, Coat_Weight=0.25, Coat_Roughness=0.3)
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    coords = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (scale * 0.15, scale * 0.15, scale * 2.5)
    wave = nodes.new("ShaderNodeTexWave")
    wave.wave_type = "RINGS"
    wave.inputs["Scale"].default_value = 3.0
    wave.inputs["Distortion"].default_value = 6.0
    wave.inputs["Detail"].default_value = 4.0
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 40.0
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = linear(dark)
    ramp.color_ramp.elements[1].color = linear(color)
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "FLOAT"
    mix.inputs["Factor"].default_value = 0.2
    links.new(coords.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    links.new(wave.outputs["Fac"], mix.inputs["A"])
    links.new(noise.outputs["Fac"], mix.inputs["B"])
    links.new(mix.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], nodes["Principled BSDF"].inputs["Base Color"])
    return material


def wax_material(color="#e2a93a"):
    """Beeswax: warm, a little translucent, so backlight glows through thin cell walls."""
    return principled(
        "Wax",
        Base_Color=linear(color),
        Roughness=0.35,
        Subsurface_Weight=0.6,
        Subsurface_Radius=(1.0, 0.55, 0.2),
        Subsurface_Scale=0.02,
    )


def emission_material(name, color, strength):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.remove(nodes["Principled BSDF"])
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = linear(color)
    emit.inputs["Strength"].default_value = strength
    material.node_tree.links.new(emit.outputs[0], nodes["Material Output"].inputs["Surface"])
    return material


def area_light(name, location, target, size, energy, color=SUN, shape="DISK"):
    data = bpy.data.lights.new(name, "AREA")
    data.shape = shape
    data.size = size
    data.energy = energy
    data.color = linear(color)[:3]
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    aim(light, target)
    return light


def aim(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def backlight_rig(target=(0, 0, 0), scale=1.0, sun_energy=900.0, rim_energy=260.0):
    """The hero's light: a big warm sun behind and up right, a rim from the left, a faint fill.

    `scale` is the subject's rough size in metres; distances and sizes follow it.
    """
    s = scale
    tx, ty, tz = target
    area_light("Sun", (tx + 2.2 * s, ty + 3.2 * s, tz + 2.4 * s), target, 2.6 * s, sun_energy * s * s)
    area_light(
        "Rim", (tx - 2.4 * s, ty + 1.8 * s, tz + 0.9 * s), target, 1.2 * s, rim_energy * s * s,
        color="#ffd9a0",
    )
    area_light(
        "Fill", (tx + 0.6 * s, ty - 3.5 * s, tz + 0.6 * s), target, 3.0 * s, 18.0 * s * s,
        color="#ffb46a",
    )


def sun_glow_card(location, target, size, strength=6.0, falloff=2.2, color=SUN):
    """A see-through card behind the subject that glows brightest in its middle and fades to
    nothing at its edge: the hero's sun glow. Light passing through honey in front of it is
    what makes the honey shine."""
    bpy.ops.mesh.primitive_plane_add(size=2 * size, location=location)
    card = bpy.context.active_object
    card.name = "SunGlow"
    aim(card, target)
    material = bpy.data.materials.new("SunGlow")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.remove(nodes["Principled BSDF"])
    coords = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1 / size, 1 / size, 1 / size)
    gradient = nodes.new("ShaderNodeTexGradient")
    gradient.gradient_type = "SPHERICAL"
    power = nodes.new("ShaderNodeMath")
    power.operation = "POWER"
    power.inputs[1].default_value = falloff
    scale = nodes.new("ShaderNodeMath")
    scale.operation = "MULTIPLY"
    scale.inputs[1].default_value = strength
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = linear(color)
    clear = nodes.new("ShaderNodeBsdfTransparent")
    add = nodes.new("ShaderNodeAddShader")
    links.new(coords.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], gradient.inputs["Vector"])
    links.new(gradient.outputs["Fac"], power.inputs[0])
    links.new(power.outputs[0], scale.inputs[0])
    links.new(scale.outputs[0], emit.inputs["Strength"])
    links.new(clear.outputs[0], add.inputs[0])
    links.new(emit.outputs[0], add.inputs[1])
    links.new(add.outputs[0], nodes["Material Output"].inputs["Surface"])
    card.data.materials.append(material)
    card.visible_shadow = False
    card.visible_diffuse = False
    card.visible_glossy = False
    return card


def bokeh(count, center, spread, radius, seed=3, strength=3.0):
    """Small emissive spheres far behind the focus: they blur into the hero's bokeh discs."""
    import random

    rng = random.Random(seed)
    material = emission_material("Bokeh", "#ffcf87", strength)
    cx, cy, cz = center
    sx, sy, sz = spread
    for i in range(count):
        location = (
            cx + rng.uniform(-sx, sx),
            cy + rng.uniform(-sy, sy),
            cz + rng.uniform(-sz, sz),
        )
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=12, ring_count=6, radius=radius * rng.uniform(0.5, 1.4), location=location
        )
        sphere = bpy.context.active_object
        sphere.name = f"Bokeh{i}"
        sphere.data.materials.append(material)
        sphere.visible_shadow = False
        sphere.visible_diffuse = False
        sphere.visible_glossy = False
        sphere.visible_transmission = False


def camera(location, target, lens=85, fstop=2.0, focus=None):
    data = bpy.data.cameras.new("Camera")
    data.lens = lens
    cam = bpy.data.objects.new("Camera", data)
    bpy.context.collection.objects.link(cam)
    cam.location = location
    aim(cam, target)
    focus_point = Vector(focus if focus is not None else target)
    data.dof.use_dof = True
    data.dof.focus_distance = (focus_point - cam.location).length
    data.dof.aperture_fstop = fstop
    data.dof.aperture_blades = 0
    bpy.context.scene.camera = cam
    return cam


def floor(z=0.0, size=40.0, color="#060302", roughness=0.28, specular=0.5):
    """A dark, slightly glossy surface that catches the backlight and fades into the dark."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    plane = bpy.context.active_object
    plane.name = "Floor"
    plane.data.materials.append(
        principled("Floor", Base_Color=linear(color), Roughness=roughness, Specular_IOR_Level=specular)
    )
    return plane


def render(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("rendered", path)


def backlit_wax_material(color="#e8a030", translucency=0.75):
    """Thin wax lit from behind: mostly translucent, so the light shows through it."""
    material = wax_material(color)
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    output = nodes["Material Output"]
    translucent = nodes.new("ShaderNodeBsdfTranslucent")
    translucent.inputs["Color"].default_value = linear(color)
    mix = nodes.new("ShaderNodeMixShader")
    mix.inputs["Fac"].default_value = translucency
    links.new(nodes["Principled BSDF"].outputs[0], mix.inputs[1])
    links.new(translucent.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0], output.inputs["Surface"])
    return material


def amber_glass_material(color=HONEY, roughness=0.05):
    """Honey as a coloured clear surface, for thin layers that are not closed volumes."""
    return principled("HoneyFilm", Base_Color=linear(color), Roughness=roughness, IOR=1.49,
                      Transmission_Weight=1.0)


def cell_honey_material(color=HONEY, glow=0.55):
    """Honey sitting in comb cells. Real comb glows because light comes through the wax behind
    the honey; a sheet of comb seen from the front has no light behind it, so a faint
    emission stands in for that glow."""
    material = amber_glass_material(color, 0.02)
    bsdf = material.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Emission Color"].default_value = linear(color)
    bsdf.inputs["Emission Strength"].default_value = glow
    return material
