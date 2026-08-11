// GraphQL Query definitions
const FIND_PRODUCT_QUERY = `query FindProduct($id: ID!) {
  findProduct(id: $id) {
    id
    name
    category
    price
    stock
    description
  }
}`;

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const idInput = document.getElementById('productIdInput');
  const queryBtn = document.getElementById('queryBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const displayContainer = document.getElementById('displayContainer');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  const gqlQueryCode = document.getElementById('gqlQueryCode');
  const gqlVariablesCode = document.getElementById('gqlVariablesCode');
  const gqlRawCode = document.getElementById('gqlRawCode');

  // Initialize Code Inspector display
  updateInspectorPayloads('', {});

  // Tab switching logic
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.remove('hidden');
    });
  });

  // Preset button clicking
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-id');
      idInput.value = targetId;
      runQuery(targetId);
    });
  });

  // Query Button clicking
  queryBtn.addEventListener('click', () => {
    const targetId = idInput.value.trim();
    if (!targetId) {
      showError('Input Required', 'Please enter a valid Product ID.');
      return;
    }
    
    // Synced preset active states
    presetBtns.forEach(b => {
      if (b.getAttribute('data-id') === targetId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    runQuery(targetId);
  });

  // Trigger default load
  runQuery('P101');

  // Main GraphQL Fetch request function
  async function runQuery(productId) {
    showLoading();
    
    const variables = { id: productId };
    updateInspectorPayloads(productId, variables);

    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: FIND_PRODUCT_QUERY,
          variables: variables
        })
      });

      const result = await response.json();
      
      // Update response inspector
      gqlRawCode.textContent = JSON.stringify(result, null, 2);

      if (result.errors) {
        showError('GraphQL Error', result.errors[0].message);
      } else if (result.data && result.data.findProduct) {
        renderProduct(result.data.findProduct);
      } else {
        showError('Product Not Found', `No product exists with ID "${productId}". Try P101 - P105.`);
      }
    } catch (err) {
      console.error(err);
      gqlRawCode.textContent = JSON.stringify({ error: err.message }, null, 2);
      showError('Network Error', 'Failed to connect to the GraphQL API server. Ensure local-server.js is running.');
    }
  }

  // Display State render helpers
  function showLoading() {
    displayContainer.className = 'display-container';
    displayContainer.innerHTML = `
      <div class="skeleton-card">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-badge"></div>
        <div class="skeleton-line skeleton-grid-box"></div>
        <div class="skeleton-line skeleton-desc-label"></div>
        <div class="skeleton-line skeleton-desc-body"></div>
      </div>
    `;
  }

  function showError(title, message) {
    displayContainer.className = 'display-container';
    displayContainer.innerHTML = `
      <div class="error-card">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h3 class="error-title">${escapeHtml(title)}</h3>
        <p class="error-msg">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function renderProduct(product) {
    displayContainer.className = 'display-container';
    displayContainer.innerHTML = `
      <div class="product-card">
        <div class="product-header">
          <div class="product-title-group">
            <h3>${escapeHtml(product.name)}</h3>
            <span class="category-tag">${escapeHtml(product.category)}</span>
          </div>
        </div>
        
        <div class="product-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Price</span>
            <span class="meta-value price-val">$${product.price.toFixed(2)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Stock Status</span>
            <span class="meta-value stock-val">${product.stock} units left</span>
          </div>
        </div>

        <div class="product-desc-box">
          <span class="desc-label">Product Specifications</span>
          <p class="desc-text">${escapeHtml(product.description)}</p>
        </div>
      </div>
    `;
  }

  function updateInspectorPayloads(productId, variables) {
    // Format the printed HTML tags to highlight GraphQL
    gqlQueryCode.innerHTML = highlightGraphQL(FIND_PRODUCT_QUERY);
    gqlVariablesCode.textContent = JSON.stringify(variables, null, 2);
  }

  // Syntax highlighting for GraphQL (simple regex string replacement)
  function highlightGraphQL(queryText) {
    return escapeHtml(queryText)
      .replace(/(query|mutation|fragment|on)/g, '<span class="gql-keyword">$1</span>')
      .replace(/(\$[a-zA-Z0-9_]+)/g, '<span class="gql-var">$1</span>')
      .replace(/(ID|String|Int|Float|Boolean)/g, '<span class="gql-type">$1</span>')
      .replace(/(findProduct|id|name|category|price|stock|description)/g, '<span class="gql-field">$1</span>');
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
