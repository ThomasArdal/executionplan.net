<template>
  <div class="app">
    <header class="site-header">
      <div class="container">
        <div class="brand">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="5" height="5" rx="1" fill="#0078d4"/>
            <rect x="9.5" y="3" width="5" height="5" rx="1" fill="#0078d4" opacity="0.7"/>
            <rect x="17" y="3" width="5" height="5" rx="1" fill="#0078d4" opacity="0.5"/>
            <rect x="2" y="10" width="5" height="5" rx="1" fill="#0078d4" opacity="0.7"/>
            <rect x="9.5" y="10" width="5" height="5" rx="1" fill="#0078d4"/>
            <rect x="2" y="17" width="5" height="5" rx="1" fill="#0078d4" opacity="0.4"/>
            <line x1="7" y1="5.5" x2="9.5" y2="5.5" stroke="#0078d4" stroke-width="1.5"/>
            <line x1="14.5" y1="5.5" x2="17" y2="5.5" stroke="#0078d4" stroke-width="1.5" opacity="0.6"/>
            <line x1="4.5" y1="8" x2="4.5" y2="10" stroke="#0078d4" stroke-width="1.5"/>
            <line x1="12" y1="8" x2="4.5" y2="10" stroke="#0078d4" stroke-width="1.5" opacity="0.6"/>
            <line x1="4.5" y1="15" x2="4.5" y2="17" stroke="#0078d4" stroke-width="1.5" opacity="0.5"/>
          </svg>
          <span class="brand-name">executionplan.net</span>
        </div>
        <h1 class="site-title">SQL Execution Plan Visualizer</h1>
        <p class="site-subtitle">
          Upload or paste a SQL Server or Azure SQL execution plan XML and get an instant visual diagram.
          Runs entirely in your browser - your data never leaves your machine.
        </p>
      </div>
    </header>

    <main class="main">
      <div class="container">

        <!-- Input card -->
        <div class="card input-card">
          <h2 class="card-title">
            <span class="step-badge">1</span>
            Provide your execution plan
          </h2>

          <div
            class="drop-zone"
            :class="{ 'is-dragging': isDragging, 'has-file': fileName }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xml,.sqlplan"
              hidden
              @change="onFileInput"
            />
            <template v-if="!fileName">
              <svg class="drop-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3v13M8 12l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p class="drop-label">Drop your file here</p>
              <p class="drop-hint">Accepts <code>.xml</code> and <code>.sqlplan</code> files &nbsp;·&nbsp; or click to browse</p>
            </template>
            <template v-else>
              <svg class="file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M9 13h6M9 17h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p class="file-name">{{ fileName }}</p>
              <button class="btn-remove-file" @click.stop="clearFile" title="Remove file">
                Remove file
              </button>
            </template>
          </div>

          <div class="divider"><span>or paste XML directly</span></div>

          <textarea
            v-model="xmlText"
            class="xml-textarea"
            placeholder="Paste the raw XML content of your execution plan here..."
            spellcheck="false"
            rows="10"
          ></textarea>

          <div class="actions">
            <button
              class="btn-primary"
              :disabled="!hasInput"
              @click="visualize"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clip-rule="evenodd"/>
              </svg>
              Visualize Plan
            </button>
            <button
              v-if="plan || error"
              class="btn-secondary"
              @click="reset"
            >
              Start over
            </button>
          </div>

          <div v-if="error" class="error-banner">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div>
              <strong>Could not parse the execution plan</strong>
              <p>{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Plan output -->
        <div v-if="plan" ref="planCard" class="card plan-card">
          <h2 class="card-title">
            <span class="step-badge">2</span>
            Execution plan
          </h2>
          <div class="plan-wrapper">
            <showplan-statement :showPlan="plan" />
          </div>
        </div>

        <!-- Help section -->
        <div class="help-card">
          <h2 class="help-title">
            How to get your execution plan XML
          </h2>
          <p class="help-intro">
            SQL Server execution plans use a standardized XML schema. There are three common ways to extract this XML depending on your workflow.
          </p>

          <div class="methods">
            <div
              v-for="(method, i) in methods"
              :key="i"
              class="method"
              :class="{ 'method--open': openMethod === i }"
            >
              <button class="method-header" @click="toggleMethod(i)">
                <span class="method-number">{{ i + 1 }}</span>
                <span class="method-title-text">{{ method.title }}</span>
                <span class="method-badge-label">{{ method.badge }}</span>
                <svg class="chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
              <div class="method-body">
                <div v-html="method.html"></div>
              </div>
            </div>
          </div>

          <div class="tip-box">
            <strong>Tip:</strong> When copying XML from web-based tools or log viewers, the
            brackets can sometimes be HTML-encoded as <code>&amp;lt;</code> and <code>&amp;gt;</code>
            instead of <code>&lt;</code> and <code>&gt;</code>. This visualizer handles
            that automatically.
          </div>
        </div>

      </div>
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>executionplan.net with ❤️ by <a href="https://elmah.io" target="_blank" rel="noopener">elmah.io</a> &nbsp;·&nbsp; Powered by <a href="https://github.com/showplan/showplan-js" target="_blank" rel="noopener">showplan-js</a> and <a href="https://github.com/showplan/showplan-vue" target="_blank" rel="noopener">showplan-vue</a></p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ShowPlanParser } from 'showplan-js'

export default {
  name: 'App',
  data() {
    return {
      isDragging: false,
      fileName: '',
      xmlText: '',
      plan: null,
      error: null,
      openMethod: 0,
      methods: [
        {
          title: 'SQL Server Management Studio (SSMS) or Azure Data Studio',
          badge: 'Most common',
          html: `
            <ol>
              <li>Open your query in SSMS or Azure Data Studio.</li>
              <li>Enable the actual execution plan by pressing <kbd>Ctrl</kbd> + <kbd>M</kbd>, or clicking the <strong>"Include Actual Execution Plan"</strong> toolbar button.</li>
              <li>Execute your query.</li>
              <li>Click the <strong>Execution Plan</strong> tab in the results pane.</li>
              <li>Right-click the plan canvas and select <strong>"Save Execution Plan As..."</strong> (saves a <code>.sqlplan</code> file) - or select <strong>"View Showplan XML..."</strong> to open the raw XML in a new tab, then copy the text.</li>
            </ol>
            <p>Upload the <code>.sqlplan</code> file directly, or paste the copied XML into the text area above.</p>
          `
        },
        {
          title: 'Generate XML via T-SQL (scripting / automation)',
          badge: 'Code-based',
          html: `
            <p>Run these commands in a query window to get the XML directly from SQL Server.</p>
            <p><strong>Estimated plan</strong> (does not execute the query):</p>
            <pre><code>SET SHOWPLAN_XML ON;
GO

-- Replace with your query
SELECT * FROM MyTable WHERE Id = 1;
GO

SET SHOWPLAN_XML OFF;
GO</code></pre>
            <p><strong>Actual plan</strong> (executes the query and captures runtime metrics):</p>
            <pre><code>SET STATISTICS XML ON;
GO

-- Replace with your query
SELECT * FROM MyTable WHERE Id = 1;
GO

SET STATISTICS XML OFF;
GO</code></pre>
            <p>SQL Server returns a result set with a single clickable XML cell. Click it to open the raw XML, then copy and paste it above.</p>
          `
        },
        {
          title: 'Extract from the plan cache (for already-executed queries)',
          badge: 'DBA / advanced',
          html: `
            <p>If a query has already run on the server, you can pull its cached execution plan using Dynamic Management Views (DMVs):</p>
            <pre><code>SELECT TOP 10
    st.text          AS QueryText,
    qp.query_plan    AS ShowplanXML,
    qs.execution_count,
    qs.total_worker_time
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp
WHERE st.text LIKE '%YourTableName%'
ORDER BY qs.total_worker_time DESC;</code></pre>
            <p>Click the value in the <code>ShowplanXML</code> column to open the raw XML, then copy and paste it above.</p>
            <p><em>Note: plans may be evicted from the cache under memory pressure or after a server restart.</em></p>
          `
        }
      ]
    }
  },
  computed: {
    hasInput() {
      return this.xmlText.trim().length > 0
    }
  },
  methods: {
    onDrop(e) {
      this.isDragging = false
      const file = e.dataTransfer.files[0]
      if (file) this.loadFile(file)
    },
    onFileInput(e) {
      const file = e.target.files[0]
      if (file) this.loadFile(file)
      e.target.value = ''
    },
    loadFile(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.xmlText = e.target.result
        this.fileName = file.name
      }
      reader.readAsText(file)
    },
    clearFile() {
      this.fileName = ''
    },
    reset() {
      this.fileName = ''
      this.xmlText = ''
      this.plan = null
      this.error = null
    },
    decodeHtmlEntities(str) {
      return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    },
    visualize() {
      this.error = null
      this.plan = null

      try {
        const xml = this.decodeHtmlEntities(this.xmlText.trim())
        this.plan = ShowPlanParser.Parse(xml)
        this.$nextTick(() => {
          this.$refs.planCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      } catch (e) {
        this.error = e.message || 'The XML could not be parsed. Make sure it is a valid SQL Server execution plan.'
      }
    },
    toggleMethod(i) {
      this.openMethod = this.openMethod === i ? null : i
    }
  }
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --blue: #0078d4;
  --blue-dark: #005a9e;
  --blue-light: #e8f3fb;
  --text: #1a1a2e;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --bg: #f3f4f6;
  --card-bg: #ffffff;
  --radius: 10px;
  --shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

code, pre, kbd {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header */
.site-header {
  background: linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #0a1628 100%);
  color: white;
  padding: 56px 0 64px;
  text-align: center;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.brand-icon {
  width: 40px;
  height: 40px;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255,255,255,0.9);
}

.site-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  color: white;
}

.site-subtitle {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.72);
  max-width: 600px;
  margin: 0 auto;
}

/* Main */
.main {
  padding: 40px 0 80px;
}

/* Cards */
.card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 24px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--blue);
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Drop zone */
.drop-zone {
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  margin-bottom: 20px;
  background: #fafafa;
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: var(--blue);
  background: var(--blue-light);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: #22c55e;
  background: #f0fdf4;
}

.drop-icon {
  width: 40px;
  height: 40px;
  color: var(--text-muted);
  margin: 0 auto 12px;
}

.drop-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.drop-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.drop-hint code {
  background: #e9ecef;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.82rem;
}

.file-icon {
  width: 36px;
  height: 36px;
  color: #22c55e;
  margin: 0 auto 10px;
}

.file-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 10px;
  word-break: break-all;
}

.btn-remove-file {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  transition: color 0.1s, border-color 0.1s;
}

.btn-remove-file:hover {
  color: #ef4444;
  border-color: #ef4444;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* Textarea */
.xml-textarea {
  width: 100%;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fafafa;
  color: var(--text);
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  margin-bottom: 20px;
}

.xml-textarea:focus {
  border-color: var(--blue);
  background: white;
}

.xml-textarea::placeholder {
  color: #9ca3af;
}

/* Buttons */
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--blue);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 11px 24px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn-primary svg {
  width: 18px;
  height: 18px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--blue-dark);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-secondary {
  background: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 11px 18px;
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.btn-secondary:hover {
  color: var(--text);
  border-color: #9ca3af;
}

/* Error */
.error-banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.9rem;
}

.error-banner svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #ef4444;
}

.error-banner strong {
  display: block;
  margin-bottom: 2px;
}

.error-banner p {
  color: #b91c1c;
}

/* Plan output */
.plan-card {
  overflow: visible;
}

.plan-wrapper {
  --background: #ffffff;
  --foreground: #1a1a2e;
  --alt-background: #f3f4f6;
  --border: #e5e7eb;
  --alt-border: #d1d5db;
  --red: #dc2626;
  --blue: #0078d4;
  --green: #16a34a;
  --grey: #6b7280;
  --brown: #92400e;
  --orange: #ea580c;
  --purple: #7c3aed;
  --light-blue: #0369a1;
  border-radius: 8px;
  overflow-x: auto;
  min-height: 200px;
}

/* Ensure showplan-vue tab buttons are always readable */
.plan-wrapper button {
  color: var(--foreground) !important;
}

/* Help section */
.help-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
}

.help-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.help-intro {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 28px;
  max-width: 680px;
}

/* Methods accordion */
.methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.method {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.method--open {
  border-color: var(--blue);
}

.method-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  transition: background 0.1s;
}

.method-header:hover {
  background: #f9fafb;
}

.method-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--blue-light);
  color: var(--blue);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.method--open .method-number {
  background: var(--blue);
  color: white;
}

.method-title-text {
  flex: 1;
}

.method-badge-label {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  background: #e0f2fe;
  color: #0369a1;
  white-space: nowrap;
}

.chevron {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.method--open .chevron {
  transform: rotate(180deg);
}

.method-body {
  display: none;
  padding: 0 20px 20px;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.7;
}

.method--open .method-body {
  display: block;
}

.method-body ol,
.method-body p {
  margin-bottom: 12px;
}

.method-body ol {
  padding-left: 20px;
}

.method-body li {
  margin-bottom: 6px;
}

.method-body kbd {
  display: inline-block;
  padding: 1px 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-bottom-width: 2px;
  border-radius: 4px;
  font-size: 0.82rem;
  color: var(--text);
}

.method-body pre {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 7px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  font-size: 0.82rem;
  line-height: 1.7;
}

.method-body code {
  font-size: 0.82rem;
}

.method-body p > code {
  background: #f3f4f6;
  padding: 1px 5px;
  border-radius: 3px;
}

.method-body strong {
  font-weight: 600;
}

/* Tip box */
.tip-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 0.875rem;
  color: #78350f;
  line-height: 1.6;
}

.tip-box strong {
  font-weight: 600;
}

.tip-box code {
  background: #fef3c7;
  padding: 1px 4px;
  border-radius: 3px;
}

/* Footer */
.site-footer {
  background: #1a1a2e;
  color: rgba(255,255,255,0.5);
  text-align: center;
  padding: 28px 0;
  font-size: 0.85rem;
}

.site-footer a {
  color: rgba(255,255,255,0.75);
  text-decoration: none;
}

.site-footer a:hover {
  color: white;
}

/* Responsive */
@media (max-width: 640px) {
  .card, .help-card {
    padding: 20px;
  }

  .site-header {
    padding: 40px 0 48px;
  }

  .method-badge-label {
    display: none;
  }
}
</style>
