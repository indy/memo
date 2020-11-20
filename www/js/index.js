import { render } from '/lib/preact/mod.js';
import Net from '/js/Net.js';
import { App, buildInitialState } from '/js/App.js';

document.addEventListener('DOMContentLoaded', async function() {
  const state = await buildInitialState();
  render(App(state), document.getElementById('root'));
});
