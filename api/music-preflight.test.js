'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { preflight } = require('./music-preflight');
test('missing key never calls provider', async () => {
  const report = await preflight({key:'', request:()=>{throw Error('unexpected')}, log:()=>{}});
  assert.equal(report.configured, false);
});
test('billing is read-only and logs only allowed fields', async () => {
  let output;
  const report = await preflight({key:'fake-test-secret', log:s=>output=s, request:async (url, options)=>{
    assert.equal(url, 'https://api.mureka.ai/v1/account/billing');
    assert.equal(options.method,'GET');
    assert.equal(options.redirect,'error');
    return {ok:true,status:200,json:async()=>({balance:500,total_spending:0,account_id:123,secret:'fake-test-secret'})};
  }});
  assert.equal(report.balance,500);
  assert.equal(report.generationEnabled,false);
  assert.ok(!output.includes('fake-test-secret'));
  assert.ok(!output.includes('account_id'));
});
test('provider error content is never logged', async () => {
  let output;
  await preflight({key:'fake-test-secret',log:s=>output=s,request:async()=>{throw Error('fake-test-secret')}});
  assert.ok(!output.includes('fake-test-secret'));
});
