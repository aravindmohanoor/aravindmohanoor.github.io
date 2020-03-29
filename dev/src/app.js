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
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: `
      <h3>
        {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
      </h3>
      <h4>
         {{ authors }} - {{ publish_date }}
      </h4>
      <p>{{ abstract_excerpt }}</p>
    `,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

// Create the render function
const renderHits = (renderOptions, isFirstRender) => {
  const { hits, widgetParams } = renderOptions;

  widgetParams.container.innerHTML = `
    <ul style="list-style-type:none">
      ${hits
    .map(
      item =>
        `<li>
              <h3>${instantsearch.highlight({ attribute: 'title', hit: item })}</h3>
              <h5><i>${item.authors} - ${item.year} - DOI:<a target="_blank" href="${item.url}">${item.doi}</a></i></h5>
              <p>${instantsearch.highlight({ attribute: 'section_text', hit: item })}</p>
              <div class="result_snippet">
              <h5>${item.best_result_title}</h5>
              <p>${instantsearch.highlight({ attribute: 'best_result_snippet', hit: item })}</p>
              </div>
              <div class="method_snippet">
              <h5>${item.best_method_title}</h5>
              <p>${instantsearch.highlight({ attribute: 'best_method_snippet', hit: item })}</p>
              </div>
            </li>`
      
    )
    .join('')}
    </ul>
  `;
};

// Create the custom widget
const customHits = instantsearch.connectors.connectHits(renderHits);

// Instantiate the custom widget
search.addWidgets([
  customHits({
    container: document.querySelector('#hits'),
  })
]);

search.start();
