/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: Implement specular lighting for the mesh
 *      @task4: Support multiple textures for the mesh
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
		this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');

		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.numTriangles = 0;

		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
		this.ambientIntensityLoc  = gl.getUniformLocation(this.prog, 'ambient');
		this.enableLightBoolLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
		this.vertNormalLoc = gl.getAttribLocation(this.prog, 'normal');
		this.normalbuffer = gl.createBuffer();

		// Texture buffers for Task 4
		this.texture0 = null;
		this.texture1 = null;
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(normalCoords),
			gl.STATIC_DRAW
		);
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
			gl.enableVertexAttribArray(this.vertNormalLoc);
			gl.vertexAttribPointer(this.vertNormalLoc, 3, gl.FLOAT, false, 0, 0);
		}

		{
			const zFixed = -1;
			const lightDir = normalize([lightX, lightY, zFixed]);
		
			gl.uniform3f(this.lightPosLoc, ...lightDir);
		}

		// Activate textures for Task 4
		if (this.texture0) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture0);
			gl.uniform1i(gl.getUniformLocation(this.prog, 'tex0'), 0);
		}
		if (this.texture1) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texture1);
			gl.uniform1i(gl.getUniformLocation(this.prog, 'tex1'), 1);
		}

		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img, textureUnit) {
		const texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0 + textureUnit); // Belirli bir doku birimini seç
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Doku resim verisini ayarla
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img
		);

		// Doku parametrelerini ayarla (Power of 2 değilse)
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}

		gl.useProgram(this.prog);
		const sampler = gl.getUniformLocation(this.prog, `tex${textureUnit}`);
		gl.uniform1i(sampler, textureUnit);

		// Store texture for use in draw function
		if (textureUnit === 0) {
			this.texture0 = texture;
		} else if (textureUnit === 1) {
			this.texture1 = texture;
		}
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(show) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.enableLightBoolLoc, show);
		if (show) {
			const ambientValue = parseFloat(document.getElementById("ambient-light-setter").value) / 100;
			this.setAmbientLight(ambientValue);
	
			const specularValue = 0.5; 
			const shininessValue = 32.0; 
	
			gl.uniform1f(this.specularIntensityLoc, specularValue);
			gl.uniform1f(this.shininessLoc, shininessValue);
		}
	}
	
	setAmbientLight(ambient) {
		console.log(`Ambient Light value from slider: ${ambient}`);
		gl.useProgram(this.prog);
		gl.uniform1f(this.ambientIntensityLoc, ambient);
	}
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = normal;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
precision mediump float;

uniform bool showTex;
uniform bool enableLighting;
uniform sampler2D tex0; // Birinci doku
uniform sampler2D tex1; // İkinci doku

uniform vec3 color; 
uniform vec3 lightPos;
uniform float ambient;

uniform float specularIntensity; 
uniform float shininess;         

varying vec2 v_texCoord;
varying vec3 v_normal;

void main()
{
    vec3 lighting = vec3(0.0);
    if(showTex && enableLighting)
	{
        vec3 normalizedNormal = normalize(v_normal);
        
        // Normalize ışık yönü
        vec3 lightDirection = normalize(lightPos);
        // Diffüz aydınlatma hesaplama
        float diff = max(dot(normalizedNormal, lightDirection), 0.0);
        
        vec3 diffuseLight = diff * vec3(1.0, 1.0, 1.0); 
        vec3 ambientLight = ambient * vec3(1.0, 1.0, 1.0); 

        // Specular aydınlatma hesaplama
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0)); // Kamera pozisyonu varsayılan
        vec3 reflectDir = reflect(-lightDirection, normalizedNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specularLight = specularIntensity * spec * vec3(1.0, 1.0, 1.0);

        // Toplam aydınlatma
        lighting = ambientLight + diffuseLight + specularLight;

        // Dokuları karıştır
        vec4 baseColor = texture2D(tex0, v_texCoord);
        vec4 secondTexture = texture2D(tex1, v_texCoord);
        vec4 finalColor = mix(baseColor, secondTexture, 0.5); // İki dokuyu karıştır
        
        gl_FragColor = finalColor * vec4(lighting, 1.0);
    }
    else if(showTex){
        gl_FragColor = texture2D(tex0, v_texCoord);
    }
    else{
        gl_FragColor =  vec4(1.0, 0, 0, 1.0);
    }

}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////
