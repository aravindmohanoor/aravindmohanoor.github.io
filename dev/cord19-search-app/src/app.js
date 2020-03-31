/* global algoliasearch instantsearch */

const searchClient = algoliasearch(
  'ZZ2ZTTMSBH',
  '71090d1229c06a4d72829a3d0d59d6bc'
);

const search = instantsearch({
  indexName: 'papers_dev',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.currentRefinements({
    container: '#current-refinements',
  }),

  instantsearch.widgets.refinementList({
    container: '#brand-list',
    attribute: 'journal',
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 10,
    facetingAfterDistinct: true,
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: `
        <div>
          <img src="{{image}}" align="left" alt="{{name}}" />
          <div class="hit-name">
            {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
          </div>
          <div class="hit-description">
            {{#helpers.highlight}}{ "attribute": "abstract_excerpt" }{{/helpers.highlight}}
          </div>
          <span class="badge badge-secondary">{{ best_method_title }}</span>
          <div class="hit-description">
            {{#helpers.highlight}}{ "attribute": "best_method_snippet" }{{/helpers.highlight}}
          </div>
        </div>
      `,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);


search.start();
