import test from 'node:test';
import assert from 'node:assert/strict';
import {googleAvatar} from '../profile-avatar.js';
test('Profile pictures allow Google HTTPS images and reject unsafe or unrelated URLs',()=>{
 assert.equal(googleAvatar('https://lh3.googleusercontent.com/a/avatar=s96-c'),'https://lh3.googleusercontent.com/a/avatar=s96-c');
 for(const value of [null,{},'', 'javascript:alert(1)','data:image/svg+xml,abc','http://lh3.googleusercontent.com/avatar','https://lh3.googleusercontent.com.evil.example/avatar','https://evil.example/avatar','https://user:password@lh3.googleusercontent.com/avatar','https://lh3.googleusercontent.com:8080/avatar','x'.repeat(2049)])assert.equal(googleAvatar(value),'');
});
