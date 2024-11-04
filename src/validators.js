const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sshKeyToPEM = require('ssh-key-to-pem');

module.exports.validateRegisterInput = (
    username,
    email,
    password,
    cpassword
) => {
    const errors = {};
    if(username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if(email.trim() === '') {
        errors.email = 'Email must not be empty';
    } else {
        const re = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if(!email.match(re)) {
            errors.email = 'Email must be a valid email address';
        }
    }
    if(password === '') {
        errors.password = 'Password must not be empty';
    } else if(password != cpassword) {
        errors.password = 'Passwords must match';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}

module.exports.validateLoginInput = (
    username,
    password
) => {
    const errors = {};
    if(username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if(password === '') {
        errors.password = 'Password must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}


class JWTVerifier {
  constructor(public_key) {
    // Convert OpenSSH public key to PEM format
    this.public_key = sshKeyToPEM(public_key);
  }

  decodeBase64Url(input) {
    // Convert base64url to base64
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64');
  }

  verify(token) {
      // Split the JWT into parts
      const [headerB64, payloadB64, signatureB64] = token.split('.');
      
      if (!headerB64 || !payloadB64 || !signatureB64) {
        throw new Error('Invalid token format');
      }

      // Decode header and payload
      const header = JSON.parse(this.decodeBase64Url(headerB64).toString());
      const payload = JSON.parse(this.decodeBase64Url(payloadB64).toString());

      // Verify algorithm
      if (header.alg !== 'RS256') {
        throw new Error('Unsupported algorithm');
      }

      // Create verification input (header.payload)
      const verifyInput = `${headerB64}.${payloadB64}`;

      // Decode signature
      const signature = this.decodeBase64Url(signatureB64);

      // Create verifier
      const verifier = crypto.createVerify('SHA256');
      verifier.update(verifyInput);

      // Verify signature
      const isValid = verifier.verify(this.public_key, signature);

      if (!isValid) {
        throw 'Invalid signature';
      }

      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error('Token has expired');
      }

      return payload;
  }
}



module.exports.validateLoginToken = (
    username,
    token,
    public_key
) => {
    let errors = {};
    let payload = {};
    if(username.trim() === '') {
        errors.username = 'Username must not be empty';
    }

    try {
      const verifier = new JWTVerifier(public_key)
      payload = verifier.verify(token);
      //console.log('Verification result:', payload);
    } catch (e) {
        console.log('ERROR', e)
	errors.verification = 'Failed to verify the token...';
    }

    if(payload.username && payload.username !== username) {
        errors.username = 'credentials mismatch (different user?)'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}
