import { ComplexSpriteDrawData, TextDrawData } from "../Renderer";
import Color from "../../math/Color";
import Rectangle from "../../math/Rectangle";
import Vector2 from "../../math/Vector2";
import MathUtil from "../../utilities/MathUtil";
import RendererUtil from "../../utilities/RendererUtil";
import Canvas2DRenderer from "../Canvas2DRenderer";
import WebGLRenderer from "../WebGLRenderer";
import Matrix4 from "./Matrix4";
import vertShader from './shaders/simple.vert';
import fragShader from './shaders/simple.frag';
import Graphic from "../../graphic/Graphic";
import WebGLGraphic from "../../graphic/types/WebGLGraphic";
export default class GLTextureRenderer {
    vertShader: string = vertShader;

    fragShader: string = fragShader;

    textCtx: CanvasRenderingContext2D;

    positionLocation: number;
    texcoordLocation: number;

    alphaLocation: WebGLUniformLocation | null;
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

        this.textCtx = document.createElement("canvas").getContext("2d", {
            alpha: true,
            preserveDrawingBuffer: true,
            desynchronized: false,
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;

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

    public drawImageRaw(image: Graphic, x: number, y: number, width: number, height: number, alpha: number): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.getTexture(image as WebGLGraphic));

        // Tell WebGL to use this program
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);

        // this matrix will translate our quad to dstX, dstY
        const offset = this.renderer.getSafeAreaOffset();

        matrix = Matrix4.translate(matrix, x + offset.x, y + offset.y, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, width, height, 1);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, alpha);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    public drawImageRotatableRaw(image: Graphic, x: number, y: number, angle: number, width: number, height: number, alpha: number, originX: number, originY: number): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.getTexture(image as WebGLGraphic));

        // Tell WebGL to use our shader program pair
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);

        // this matrix will translate our quad to dstX, dstY
        const offset = this.renderer.getSafeAreaOffset();

        matrix = Matrix4.translate(matrix, (x + offset.x) + originX, (y + offset.y) + originY, 0);
        matrix = Matrix4.zRotate(matrix, MathUtil.toRad(angle));
        matrix = Matrix4.translate(matrix, -originX, -originY, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, width, height, 1);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, alpha);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    private makeTextCanvas(text: string, data: TextDrawData): ImageData {
        this.textCtx.font = `${data.size}px ${data.font}`;
        this.textCtx.fillStyle = data.color.asCSSRGBA();

        const metrics = this.textCtx.measureText(text);
        let canvasWidth = Math.ceil(metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft) + 2;
        let canvasHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + Math.abs(metrics.hangingBaseline));
        if (data.allowPrecisePosition) {
            canvasWidth = metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft + 2;
            canvasHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + Math.abs(metrics.hangingBaseline);
        }
        if (data.dropShadow != undefined) {
            canvasWidth += data.dropShadow.offset.x;
            canvasHeight += data.dropShadow.offset.y;
        }
        if (data.boundaries != undefined) {
            canvasWidth = data.boundaries.width;

            // todo betterway to get height
            canvasHeight = Canvas2DRenderer.wrapText(this.textCtx, text, data.boundaries.noWrap ? Number.MAX_SAFE_INTEGER : data.boundaries.width, 0, 0, data.size, data.boundaries.lineHeight != undefined ? data.boundaries.lineHeight : data.size * 0.5, false).y;
        }

        this.textCtx.canvas.width = canvasWidth;
        // we can add data.size to ensure that 0 clipping occurs but this whole function is lowk jank
        this.textCtx.canvas.height = canvasHeight + data.size;


        // Adjusting the dimensions resets these variables in the canvas
        this.textCtx.imageSmoothingEnabled = false;
        this.textCtx.textRendering = "optimizeSpeed";
        this.textCtx.font = `${data.size}px ${data.font}`;
        this.textCtx.fillStyle = data.color.asCSSRGBA();
        this.textCtx.textAlign = "left";
        this.textCtx.textBaseline = "top";
        if (data.dropShadow != undefined) {
            this.textCtx.shadowColor = data.dropShadow.color.asCSSRGBA();
            this.textCtx.shadowOffsetX = data.dropShadow.offset.x;
            this.textCtx.shadowOffsetY = data.dropShadow.offset.y;
        }


        if (data.boundaries != undefined) {
            this.textCtx.textAlign = data.boundaries.alignment;
            Canvas2DRenderer.wrapText(this.textCtx, text, data.boundaries.noWrap ? Number.MAX_SAFE_INTEGER : data.boundaries.width, 0, 0, data.size, data.boundaries.lineHeight != undefined ? data.boundaries.lineHeight : data.size * 0.5);
        }
        else {
            this.textCtx.fillText(text, 0, 0);
        }


        if (data.dropShadow != undefined) {
            this.textCtx.shadowColor = Color.TRANSPARENT.asCSSRGBA();
        }
        return this.textCtx.getImageData(0, 0, this.textCtx.canvas.width, this.textCtx.canvas.height);
    }

    public drawTextRaw(text: string, x: number, y: number, data: TextDrawData): void {
        const offset = this.renderer.getSafeAreaOffset();

        const textTex = this.gl.createTexture();
        const cnv = this.makeTextCanvas(text, data);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cnv);
        // const's assume all images are not a power of 2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // Tell WebGL to use our shader program pair
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);

        // this matrix will translate our quad to dstX, dstY
        matrix = Matrix4.translate(matrix, x + offset.x, y + offset.y, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, cnv.width, cnv.height, 1);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, 1.0);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.deleteTexture(textTex);
    }

    public measureTextRaw(text: string, data: TextDrawData): Vector2 {
        this.textCtx.font = `${data.size}px ${data.font}`;
        this.textCtx.fillStyle = data.color.asCSSRGBA();
        const metrics = this.textCtx.measureText(text);
        let width = Math.ceil(metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft);
        let height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
        if (data.boundaries != undefined) {
            width = data.boundaries.width;
            if (data.dropShadow != undefined) {
                width += data.dropShadow.offset.x;
            }
            height = Canvas2DRenderer.wrapText(this.textCtx, text, data.boundaries.width, 0, 0, data.size, data.boundaries.lineHeight != undefined ? data.boundaries.lineHeight : data.size * 0.5, false).y;
        }

        return { x: Math.ceil(width), y: Math.ceil(height) };
    }


    private makePixel(color: Color): HTMLCanvasElement {
        this.textCtx.canvas.width = 1;
        this.textCtx.canvas.height = 1;
        this.textCtx.globalAlpha = 1;
        this.textCtx.fillStyle = color.asCSSRGBA();
        this.textCtx.beginPath();
        this.textCtx.fillRect(0, 0, 1, 1);
        this.textCtx.fill();
        this.textCtx.closePath();
        return this.textCtx.canvas;
    }


    drawRectangleRaw(rect: Rectangle, color: Color): void {
        const offset = this.renderer.getSafeAreaOffset();

        const textTex = this.gl.createTexture();
        const rendered = this.makePixel(color);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rendered);
        // const's assume all images are not a power of 2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // Tell WebGL to use our shader program pair
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);

        // this matrix will translate our quad to dstX, dstY
        matrix = Matrix4.translate(matrix, rect.x + offset.x, rect.y + offset.y, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, rect.width, rect.height, 1);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, 1.0);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.deleteTexture(textTex);
    }

    private makeRoundedRectangle(rect: Rectangle, radius: number, color: Color): HTMLCanvasElement {

        this.textCtx.canvas.width = rect.width;
        this.textCtx.canvas.height = rect.height;
        this.textCtx.globalAlpha = 1;
        this.textCtx.fillStyle = color.asCSSRGBA();
        this.textCtx.beginPath();
        this.textCtx.roundRect(0, 0, rect.width, rect.height, radius);
        this.textCtx.fill();
        this.textCtx.closePath();
        return this.textCtx.canvas;
    }

    drawRoundedRectangleRaw(rect: Rectangle, radius: number, color: Color): void {
        const textTex = this.gl.createTexture();
        const rendered = this.makeRoundedRectangle(rect, radius, color);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rendered);
        // const's assume all images are not a power of 2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // Tell WebGL to use our shader program pair
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);

        // this matrix will translate our quad to dstX, dstY
        const offset = this.renderer.getSafeAreaOffset();

        matrix = Matrix4.translate(matrix, rect.x + offset.x, rect.y + offset.y, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, rect.width, rect.height, 1);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, 1.0);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.deleteTexture(textTex);
    }

    private makeCircle(radius: number, color: Color): HTMLCanvasElement {
        const size = radius * 2;
        this.textCtx.canvas.width = size;
        this.textCtx.canvas.height = size;
        this.textCtx.globalAlpha = 1;
        this.textCtx.fillStyle = color.asCSSRGBA();
        this.textCtx.beginPath();
        this.textCtx.arc(radius, radius, radius, 0, Math.PI * 2);
        this.textCtx.fill();
        this.textCtx.closePath();
        return this.textCtx.canvas;
    }

    drawCircleRaw(x: number, y: number, radius: number, color: Color): void {
        const textTex = this.gl.createTexture();
        const rendered = this.makeCircle(radius, color);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rendered);
        // const's assume all images are not a power of 2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // Tell WebGL to use our shader program pair
        this.gl.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        let matrix = Matrix4.orthographic(0, this.renderer.canvas.width, this.renderer.canvas.height, 0, -1, 1);

        // this matrix will translate our quad to dstX, dstY
        const offset = this.renderer.getSafeAreaOffset();

        matrix = Matrix4.translate(matrix, (x + offset.x) - radius, (y + offset.y) - radius, 0);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = Matrix4.scale(matrix, rendered.width, rendered.height, 1);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.gl.uniform1i(this.textureLocation, 0);

        // tell the shader the alpha
        this.gl.uniform1f(this.alphaLocation, 1.0);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.deleteTexture(textTex);
    }
}