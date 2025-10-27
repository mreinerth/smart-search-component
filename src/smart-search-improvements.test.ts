import { html } from 'lit';
import { fixture, expect, elementUpdated, aTimeout } from '@open-wc/testing';
import { SmartSearch } from './smart-search.ts';

describe('SmartSearch Improvements', () => {
  it('should filter based on multiple filterableKeys', async () => {
    const data = [
      { name: 'John Doe', email: 'j.doe@example.com' },
      { name: 'Jane Smith', email: 'j.smith@example.com' },
    ];
    const el = await fixture<SmartSearch>(html`<smart-search .data=${data} .filterableKeys=${['name', 'email']} displayKey="name"></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');

    input!.value = 'smith';
    input!.dispatchEvent(new Event('input'));
    await aTimeout(10); // Wait for debounce

    const results = el.shadowRoot!.querySelectorAll('.result-item');
    expect(results.length).to.equal(1);
    expect(results[0].textContent.trim()).to.include('Jane Smith');
  });

  it('should debounce the input', async () => {
    const el = await fixture<SmartSearch>(html`<smart-search debounceTimeout="20"></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');
    let eventFired = false;
    el.addEventListener('search-input', () => {
      eventFired = true;
    });

    input!.value = 'a';
    input!.dispatchEvent(new Event('input'));
    await aTimeout(10);
    expect(eventFired).to.be.false;

    await aTimeout(20);
    expect(eventFired).to.be.true;
  });

  it('should limit the number of results', async () => {
    const data = [{ label: 'apple' }, { label: 'avocado' }, { label: 'apricot' }];
    const el = await fixture<SmartSearch>(html`<smart-search .data=${data} maxResults="2"></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');

    input!.value = 'a';
    input!.dispatchEvent(new Event('input'));
    await aTimeout(10); // Wait for debounce

    const results = el.shadowRoot!.querySelectorAll('.result-item');
    expect(results.length).to.equal(2);
  });

  it('should show noResultsText', async () => {
    const el = await fixture<SmartSearch>(html`<smart-search noResultsText="Nothing here"></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');

    input!.value = 'xyz';
    input!.dispatchEvent(new Event('input'));
    await elementUpdated(el);

    const noResults = el.shadowRoot!.querySelector('.no-results');
    expect(noResults).to.exist;
    if (noResults) {
      expect(noResults.textContent.trim()).to.equal('Nothing here');
    }
  });
});
