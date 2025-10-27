import { LitElement, html, css } from 'lit';
import { computePosition, flip, shift } from '@floating-ui/dom';
import { customElement, property, state, query } from 'lit/decorators.js';

interface SearchItem {
  [key: string]: any;
  icon?: string;
  description?: string;
  label?: string;
}

@customElement('smart-search')
export class SmartSearch extends LitElement {
  static styles = css`
    :host {
      --border-color: #ccc;
      --background-color: white;
      --text-color: black;
      --highlight-color: #f0f0f0;
      --description-color: #777;

      display: inline-block;
      position: relative;
      max-width: 100%;
      box-sizing: border-box;
    }

    :host([theme='dark']) {
      --border-color: #555;
      --background-color: #222;
      --text-color: white;
      --highlight-color: #444;
      --description-color: #aaa;
    }

    .search-container {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0.5em;
      background-color: var(--background-color);
      color: var(--text-color);
    }

    :host([disabled]) .search-container {
      cursor: not-allowed;
      opacity: 0.7;
      background-color: #f9f9f9;
    }

    :host([disabled]) .search-input,
    :host([disabled]) .clear-button {
      cursor: not-allowed;
    }

    :host([disabled][theme='dark']) .search-container {
      background-color: #2d2d2d;
    }

    .search-input {
      border: none;
      outline: none;
      flex-grow: 1;
      background-color: transparent;
      color: var(--text-color);
    }

    .search-input::-webkit-search-decoration,
    .search-input::-webkit-search-cancel-button,
    .search-input::-webkit-search-results-button,
    .search-input::-webkit-search-results-decoration {
      display: none;
    }

    .clear-button {
      cursor: pointer;
      background: none;
      border: none;
      color: var(--text-color);
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .clear-button.visible {
      visibility: visible;
      opacity: 1;
    }

    .results-list {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      border: 1px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 4px 4px;
      padding: 0;
      margin: 0;
      list-style: none;
      background-color: var(--background-color);
      color: var(--text-color);
      z-index: 10;
    }

    .results-list.flipped {
      border-top: 1px solid var(--border-color);
      border-bottom: none;
      border-radius: 4px 4px 0 0;
    }

    .results-list.visible {
      display: block;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.5em;
      cursor: pointer;
    }

    .result-item img {
      width: 24px;
      height: 24px;
    }

    .result-item-text {
      display: flex;
      flex-direction: column;
    }

    .result-item-label {
      font-weight: bold;
    }

    .result-item-description {
      font-size: 0.9em;
      color: var(--description-color);
    }

    .result-item:hover,
    .result-item.highlighted {
      background-color: var(--highlight-color);
    }

    .no-results {
      padding: 0.5em;
      text-align: center;
      color: var(--description-color);
    }

    .loader {
      width: 16px;
      height: 16px;
      border: 2px solid var(--highlight-color);
      border-top: 2px solid var(--border-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 0.5em;
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .loader.visible {
      visibility: visible;
      opacity: 1;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  @property({ type: String })
  placeholder = 'Search...';

  @property({ type: String, reflect: true })
  theme = 'light';

  @property({ type: Number })
  debounceTimeout = 0;

  @property({ type: Number })
  maxResults = 0;

  @property({ type: String })
  noResultsText = 'No results found';

  @property({ type: String })
  displayKey = 'label';

  @property({ type: Array })
  filterableKeys: string[] = ['label'];

  @property({ type: Boolean })
  loading = false;

  @property({ type: Array })
  data: SearchItem[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  value = '';

  @state()
  private _isClearable = false;

  @state()
  private _isDropdownVisible = false;

  @state()
  private _filteredData: SearchItem[] = [];

  @state()
  private _highlightedIndex = -1;

  @query('#results-list')
  private _dropdown: HTMLElement | undefined;

  private _debounceTimeoutId: number | undefined;
  private _boundUpdatePosition: () => void = () => {};

  render() {
    return html`
      <div
        class="search-container"
        role="combobox"
        aria-expanded=${this._isDropdownVisible}
        aria-haspopup="listbox"
        aria-owns="results-list"
      >
        <slot name="search-icon"></slot>
        <input
          id="search-input"
          class="search-input"
          type="search"
          .placeholder=${this.placeholder}
          role="searchbox"
          .value=${this.value}
          @input=${this._onInput}
          @focus=${this._onFocus}
          @blur=${this._onBlur}
          @keydown=${this._onKeydown}
          ?disabled=${this.disabled}
          aria-autocomplete="list"
          aria-controls="results-list"
          aria-activedescendant=${this._highlightedIndex >= 0
            ? `result-item-${this._highlightedIndex}`
            : ''}
          aria-busy=${this.loading}
        />
        <div class="loader ${this.loading ? 'visible' : ''}"></div>
        <button
          class="clear-button ${this._isClearable ? 'visible' : ''}"
          @click=${this._onClear}
        >
          <slot name="clear-icon">&times;</slot>
        </button>
      </div>
      <ul
        id="results-list"
        role="listbox"
        class="results-list ${this._isDropdownVisible ? 'visible' : ''}"
      >
        ${this._filteredData.length === 0 && this.value
          ? html`<li class="no-results">${this.noResultsText}</li>`
          : this._filteredData.map(
              (item, index) => html`
                <li
                  id="result-item-${index}"
                  class="result-item ${index === this._highlightedIndex
                    ? 'highlighted'
                    : ''}"
                  role="option"
                  aria-selected=${index === this._highlightedIndex}
                  @click=${() => this._onResultClick(item)}
                >
                  ${item.icon ? html`<img src="${item.icon}" alt="" />` : ''}
                  <div class="result-item-text">
                    <span class="result-item-label">${this._getNestedValue(item, this.displayKey)}</span>
                    <span class="result-item-description"
                      >${item.description || ''}</span
                    >
                  </div>
                </li>
              `
            )}
      </ul>
    `;
  }

  private _onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._isClearable = !!this.value;
    clearTimeout(this._debounceTimeoutId);
    this._debounceTimeoutId = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('search-input', { detail: this.value }));
      this._filterData();
      this._isDropdownVisible = !!this.value;
      this._updateDropdownPosition();
      this._highlightedIndex = -1;
    }, this.debounceTimeout);
  }

  private _onClear() {
    this.value = '';
    this._isClearable = false;
    this._filteredData = [];
    this._isDropdownVisible = false;
    this._highlightedIndex = -1;
  }

  private _onFocus() {
    this._filterData();
    if (this._filteredData.length > 0) {
      this._isDropdownVisible = true;
      this._updateDropdownPosition();
    }
  }

  private _onBlur() {
    // Delay hiding the dropdown to allow for result clicks
    setTimeout(() => {
      this._isDropdownVisible = false;
    }, 200);
  }

  private _onResultClick(item: SearchItem) {
    this.value = this._getNestedValue(item, this.displayKey);
    this._isClearable = !!this.value;
    this._isDropdownVisible = false;
    this._highlightedIndex = -1;
    this.dispatchEvent(
      new CustomEvent('result-selected', { detail: item })
    );
  }



  private _getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  private _filterData() {
    let filtered: SearchItem[] = [];
    if (this.value) {
      const filteredSet = new Set<SearchItem>();
      const lowerCaseValue = this.value.toLowerCase();

      for (const item of this.data) {
        for (const key of this.filterableKeys) {
          const value = this._getNestedValue(item, key);
          if (
            typeof value === 'string' &&
            value.toLowerCase().includes(lowerCaseValue)
          ) {
            filteredSet.add(item);
            break;
          }
        }
      }
      filtered = Array.from(filteredSet);
    }

    if (this.maxResults > 0) {
      this._filteredData = filtered.slice(0, this.maxResults);
    } else {
      this._filteredData = filtered;
    }
  }

  private _onKeydown(e: KeyboardEvent) {
    if (!this._isDropdownVisible) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._highlightedIndex = Math.min(
          this._highlightedIndex + 1,
          this._filteredData.length - 1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._highlightedIndex = Math.max(this._highlightedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (this._highlightedIndex >= 0) {
          this._onResultClick(this._filteredData[this._highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this._isDropdownVisible = false;
        break;
    }
  }

  private async _updateDropdownPosition() {
    if (!this._dropdown || !this._isDropdownVisible) {
      return;
    }

    const { x, y, placement } = await computePosition(this, this._dropdown, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [flip(), shift({ padding: 5 })],
    });

    const isFlipped = placement.startsWith('top');
    this._dropdown.classList.toggle('flipped', isFlipped);

    Object.assign(this._dropdown.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._boundUpdatePosition = this._updateDropdownPosition.bind(this);
    window.addEventListener('resize', this._boundUpdatePosition);
    document.addEventListener('scroll', this._boundUpdatePosition, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._boundUpdatePosition);
    document.removeEventListener('scroll', this._boundUpdatePosition, true);
  }

  firstUpdated() {
    this._updateDropdownPosition();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('data') && !this.loading) {
      this._filterData();
    }
  }
}
