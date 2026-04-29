precision mediump float;
varying vec2 v_texcoord;

uniform sampler2D u_texture;

uniform float u_alpha;

uniform float u_hue;

uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;


vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

vec3 adjustSaturation(vec3 color, float value) {
    const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
    vec3 grayscale = vec3(dot(color, luminosityFactor));

    return mix(grayscale, color, value);
}

void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
    gl_FragColor.rgb = hueShift(gl_FragColor.rgb, u_hue);
    gl_FragColor.rgb = adjustSaturation(gl_FragColor.rgb, u_saturation);
    gl_FragColor.rgb += vec3(u_brightness, u_brightness, u_brightness);
    gl_FragColor.rgb *= u_contrast;
    gl_FragColor.a = u_alpha * gl_FragColor.a;
}