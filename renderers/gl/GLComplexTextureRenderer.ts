import { ComplexSpriteDrawData, TextDrawData } from "../Renderer";
import Rectangle from "../../math/Rectangle";
import Vector2 from "../../math/Vector2";
import MathUtil from "../../utilities/MathUtil";
import WebGLRenderer from "../WebGLRenderer";
import Matrix4 from "./Matrix4";
import vertShader from './shaders/complex.vert';
import fragShader from './shaders/complex.frag';
import WebGLGraphic from "../../graphic/types/WebGLGraphic";
import Graphic from "../../graphic/Graphic";

export default class GLComplexTextureRenderer {
    vertShader: string = vertShader;

    fragShader: string = fragShader;

    positionLocation: number;
    texcoordLocation: number;

    alphaLocation: WebGLUniformLocation | null;
    hueLocation: WebGLUniformLocation | null;
    brightnessLocation: WebGLUniformLocation | null;
    contrastLocation: WebGLUniformLocation | null;
    saturationLocation: WebGLUniformLocation | null;

    matrixLocation: WebGLUniformLocation | null;
    textureLocation: WebGLUniformLocation | null;

    positionBuffer: WebGLBuffer;
    texcoordBuffer: WebGLBuffer;

    program: WebGLProgram;

    gl: WebGLRenderingContext;
    renderer: WebGLRenderer;
    constructor(gl: WebGLRenderingContext, renderer: WebGLRenderer) {
        this.gl = gl;
        this.renderer = renderer;

        /* Program creation */
        this.program = this.gl.createProgram();

        this.gl.attachShader(this.program, this.renderer.createShader(this.gl.VERTEX_SHADER, this.vertShader));
        this.gl.attachShader(this.program, this.renderer.createShader(this.gl.FRAGMENT_SHADER, this.fragShader));

        this.gl.linkProgram(this.program);

        // Use this program.
        this.gl.useProgram(this.program);

        // look up where the vertex data needs to go.
        this.positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texcoord");

        // lookup uniforms
        this.matrixLocation = this.gl.getUniformLocation(this.program, "u_matrix");
        this.textureLocation = this.gl.getUniformLocation(this.program, "u_texture");
        this.alphaLocation = this.gl.getUniformLocation(this.program, "u_alpha");
        this.hueLocation = this.gl.getUniformLocation(this.program, "u_hue");
        this.brightnessLocation = this.gl.getUniformLocation(this.program, "u_brightness");
        this.contrastLocation = this.gl.getUniformLocation(this.program, "u_contrast");
        this.saturationLocation = this.gl.getUniformLocation(this.program, "u_saturation");


        // Create a buffer.
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        // Put a unit quad in the buffer
        const positions = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        // Create a buffer for texture coords
        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);

        // Put texcoords in the buffer
        const texcoords = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);
    }

    drawImageComplexRaw(image: Graphic, x: number, y: number, data: ComplexSpriteDrawData): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.getTexture(image as WebGLGraphic));

        // Tell WebGL to use our shader program pair
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);

        //https://stackoverflow.com/questions/29918751/clipping-images-in-webgl
        if (data.crop != undefined) {
            const u0 = data.crop.x / image.width;
            const v0 = data.crop.y / image.height;

            const u1 = (data.crop.x + data.crop.width) / image.width;
            const v1 = (data.crop.y + data.crop.height) / image.height;
            this.gl.bufferData(this.gl.ARRAY_BUFFER,
                new Float32Array([
                    u0, v0,
                    u0, v1,
                    u1, v0,
                    u1, v0,
                    u0, v1,
                    u1, v1]),   

                this.gl.STATIC_DRAW)
        }


        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);
        const offset = this.renderer.getSafeAreaOffset();
        // this matrix will translate our quad to dstX, dstY
        matrix = Matrix4.translate(matrix, (x + offset.x) + data.origin.x, (y + offset.y) + data.origin.y, 0);
        matrix = Matrix4.zRotate(matrix, MathUtil.toRad(data.rotateZ));
        matrix = Matrix4.translate(matrix, -data.origin.x, -data.origin.y, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, data.width, data.height, 1);



        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, data.alpha);

        // tell the shader the hue
        this.gl.uniform1f(this.hueLocation, MathUtil.toRad(data.hue));

        // tell the shader the brightness
        this.gl.uniform1f(this.brightnessLocation, data.brightness - 1.0);

        // tell the shader the contrast
        this.gl.uniform1f(this.contrastLocation, data.contrast);

        // tell the shader the saturation
        this.gl.uniform1f(this.saturationLocation, data.saturation);


        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        if (data.crop != undefined) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
            // Reset texcoords
            const texcoords = [
                0, 0,
                0, 1,
                1, 0,
                1, 0,
                0, 1,
                1, 1,
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);
        }
    }
}