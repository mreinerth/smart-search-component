import { html } from 'lit';
import { fixture, expect, elementUpdated, aTimeout } from '@open-wc/testing';
import * as axe from 'axe-core';
import { SmartSearch } from './smart-search.ts';

describe('SmartSearch', () => {
  it('should render the component', async () => {
    const el = await fixture<SmartSearch>(html`<smart-search></smart-search>`);
    expect(el).to.exist;
  });

  it('should be accessible', async () => {
    const el = await fixture<SmartSearch>(html`<smart-search></smart-search>`);
    const results = await axe.run(el);
    expect(results.violations).to.be.empty;
  });

  it('should show the clear button when there is input', async () => {
    const el = await fixture<SmartSearch>(html`<smart-search></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');
    input!.value = 'test';
    input!.dispatchEvent(new Event('input'));
    await elementUpdated(el);
    const clearButton = el.shadowRoot!.querySelector('.clear-button');
    expect(clearButton).to.have.class('visible');
  });

  it('should filter data based on input', async () => {
    const data = [
      { id: '1', label: 'Apple' },
      { id: '2', label: 'Banana' },
    ];
    const el = await fixture<SmartSearch>(html`<smart-search .data=${data}></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');
    input!.value = 'apple';
    input!.dispatchEvent(new Event('input'));
    await aTimeout(10); // Wait for debounce
    const resultItems = el.shadowRoot!.querySelectorAll('.result-item');
    expect(resultItems.length).to.equal(1);
    expect(resultItems[0].textContent.trim()).to.include('Apple');
  });

  it('should fire result-selected event on click', async () => {
    const data = [{ id: '1', label: 'Apple' }];
    const el = await fixture<SmartSearch>(html`<smart-search .data=${data}></smart-search>`);
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input');
    input!.value = 'apple';
    input!.dispatchEvent(new Event('input'));
    await aTimeout(10); // Wait for debounce

    let eventFired = false;
    el.addEventListener('result-selected', () => {
      eventFired = true;
    });

    const resultItem = el.shadowRoot!.querySelector('.result-item') as HTMLElement;
    resultItem!.click();
    await elementUpdated(el);

    expect(eventFired).to.be.true;
  });
});
