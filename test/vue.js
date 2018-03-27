const assert = require('assert');
const {bundle, assertBundleTree, run} = require('./utils');
const fs = require('fs');

describe('vue', function() {
  it('should produce a basic vue bundle', async function() {
    let b = await bundle(__dirname + '/integration/vue-basic/Basic.vue');

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        },
        {
          type: 'map'
        }
      ]
    });

    let output = run(b).default;
    assert.equal(typeof output.render, 'function');
    assert.deepEqual(output.staticRenderFns, []);
    assert.equal(output._compiled, true);
    assert.deepEqual(output.data(), {msg: 'Hello from Component A!'});
  });

  it('should produce a vue bundle with dependencies', async function() {
    let b = await bundle(__dirname + '/integration/vue-dependencies/App.vue');

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        },
        {
          type: 'map'
        },
        {
          assets: ['logo.png'],
          type: 'png'
        }
      ]
    });

    let output = run(b).default;
    assert.equal(typeof output.render, 'function');
    assert.equal(output.staticRenderFns.length, 2);
    assert.deepEqual(output.data(), {msg: 'Welcome to Your Vue.js App!'});
  });

  it('should produce a vue bundle using preprocessors', async function() {
    let b = await bundle(
      __dirname + '/integration/vue-preprocessors/pre-processors.vue'
    );

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        },
        {
          type: 'map'
        }
      ]
    });

    let output = run(b);
    assert.equal(typeof output.render, 'function');
    assert.deepEqual(output.staticRenderFns, []);
    assert.deepEqual(output.data(), {msg: 'Hello from coffee!'});

    let contents = fs.readFileSync(
      __dirname + '/dist/pre-processors.css',
      'utf8'
    );
    assert(contents.includes('color: #999'));
    assert(contents.includes('background: red'));
    assert(contents.includes('color: green'));
  });

  it('should produce a vue bundle using a functional component', async function() {
    let b = await bundle(
      __dirname + '/integration/vue-functional/functional.vue'
    );

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        }
      ]
    });

    let output = run(b);
    assert.equal(typeof output.render, 'function');
    assert.equal(output.staticRenderFns.length, 1);
    assert.equal(output.functional, true);
    assert.equal(typeof output._injectStyles, 'function');

    let ctx = {};
    output._injectStyles.call(ctx);
    assert.equal(typeof ctx.$style.red, 'string');

    let contents = fs.readFileSync(__dirname + '/dist/functional.css', 'utf8');
    assert(contents.includes('.' + ctx.$style.red));
  });

  it('should produce a vue bundle using scoped styles', async function() {
    let b = await bundle(__dirname + '/integration/vue-scoped/App.vue');

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        },
        {
          type: 'map'
        }
      ]
    });

    let output = run(b).default;
    assert.equal(typeof output.render, 'function');
    assert.equal(output.staticRenderFns.length, 1);
    assert(/^data-v-[0-9a-h]{6}$/.test(output._scopeId));
    assert.deepEqual(output.data(), {ok: true});

    let contents = fs.readFileSync(__dirname + '/dist/App.css', 'utf8');
    assert(contents.includes(`.test[${output._scopeId}]`));
  });

  it('should produce a vue bundle using CSS modules', async function() {
    let b = await bundle(__dirname + '/integration/vue-css-modules/App.vue');

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        },
        {
          type: 'map'
        }
      ]
    });

    let output = run(b).default;
    assert.equal(typeof output.render, 'function');
    assert.deepEqual(output.staticRenderFns, []);
    assert(Array.isArray(output.beforeCreate));
    assert.equal(typeof output.beforeCreate[0], 'function');

    let ctx = {};
    output.beforeCreate[0].call(ctx);
    assert.equal(typeof ctx.$style.red, 'string');

    let contents = fs.readFileSync(__dirname + '/dist/App.css', 'utf8');
    assert(contents.includes('.' + ctx.$style.red));
  });

  it('should produce a basic production vue bundle', async function() {
    let b = await bundle(__dirname + '/integration/vue-basic/Basic.vue', {
      production: true
    });

    assertBundleTree(b, {
      type: 'js',
      childBundles: [
        {
          type: 'css'
        },
        {
          type: 'map'
        }
      ]
    });

    let output = run(b).default;
    assert.equal(typeof output.render, 'function');
    assert.deepEqual(output.staticRenderFns, []);
    assert.equal(output._compiled, true);
    assert.deepEqual(output.data(), {msg: 'Hello from Component A!'});
  });
});
