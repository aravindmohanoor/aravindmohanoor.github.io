/* global algoliasearch instantsearch */

const searchClient = algoliasearch(
    'ZZ2ZTTMSBH',
    '71090d1229c06a4d72829a3d0d59d6bc'
);

const search = instantsearch({
    indexName: 'abstracts',
    searchClient
});

restrictSearchableAttributesArray = [];

window.displayAttributes = ['title','section_text','abstract_excerpt','best_method_snippet','best_result_snippet'];

window.searchAttributes = ['title','section_text','abstract_excerpt','best_method_snippet','best_result_snippet'];

search.addWidgets(
    [
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
        instantsearch.widgets.refinementList({
            container: '#year-facet',
            attribute: 'year',
        }),
        instantsearch.widgets.refinementList({
            container: '#outcome-facet',
            attribute: 'outcome',
            sortBy: ['name:asc'],
            limit:100
        }),
        instantsearch.widgets.refinementList({
            container: '#difference-facet',
            attribute: 'difference',
            sortBy: ['name:asc'],
            limit:100
        }),
        instantsearch.widgets.refinementList({
            container: '#design-facet',
            attribute: 'design',
            sortBy: ['name:asc'],
            limit:100
        }),
        instantsearch.widgets.refinementList({
            container: '#disease-facet',
            attribute: 'disease',
            sortBy: ['name:asc'],
            limit:100
        }),
        instantsearch.widgets.configure({
            hitsPerPage: 10,
            //facetingAfterDistinct: true,
            restrictSearchableAttributes: restrictSearchableAttributesArray
        }),
        instantsearch.widgets.hits({
            container: '#hits',
            templates: {
                item:function(hit) {
                    var divHit = $('<div/>');
                    var liHit = $('<div/>');
                    //divHit.addClass('verticalline');
                    // var liHit = $('<li/>');
                    // liHit.addClass('hitMargin');
                    var pTitle = $('<p/>');
                    var h4Title = $('<h4>',{
                        html:hit._highlightResult.title.value
                    });
                    liHit.append(pTitle).append(h4Title);
                    strDetails =  hit.journal+' ('+hit.year+') - '+hit.authors+' - '+' <a target="_blank" href="'+hit.url+'">'+hit.doi+'</a>';
                    var pDetails = $('<p>',{
                        html:strDetails
                    });
                    liHit.append(pDetails);
                    if (window.displayAttributes.indexOf('abstract_excerpt') > -1){
                        if(hit.abstract_excerpt !== ''){
                            var h5AbstractTitle = $('<h5/>');
                            var labelAbstractTitle = $('<span>',{
                                html:'Abstract'
                            });
                            h5AbstractTitle.append(labelAbstractTitle);
                            labelAbstractTitle.addClass('badge badge-warning');
                            var pAbstract = $('<p>',{
                                html:hit._highlightResult.abstract_excerpt.value
                            });
                            liHit.append(h5AbstractTitle);
                            liHit.append(pAbstract);
                        }
                    }
                    divHit.append(liHit);
                    return divHit[0].innerHTML;
                }
            },
            /*templates: {
              item: `
                <div>
                  <div class="hit-name">
                    {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
                  </div>
                  <span class="badge badge-secondary">{{ section }}</span>
                  <div class="hit-description">
                    {{#helpers.highlight}}{ "attribute": "section_text" }{{/helpers.highlight}}
                  </div>
                  <span class="badge badge-primary">Abstract</span>
                  <div class="hit-description">
                    {{#helpers.highlight}}{ "attribute": "abstract_excerpt" }{{/helpers.highlight}}
                  </div>
                  <span class="badge badge-success">{{ best_method_title }}</span>
                  <div class="hit-description">
                    {{#helpers.highlight}}{ "attribute": "best_method_snippet" }{{/helpers.highlight}}
                  </div>
                  <span class="badge badge-danger">{{ best_result_title }}</span>
                  <div class="hit-description">
                    {{#helpers.highlight}}{ "attribute": "best_result_snippet" }{{/helpers.highlight}}
                  </div>
                </div>
              `,
            },*/
        }),
        instantsearch.widgets.pagination({
            container: '#pagination',
        }),
    ]);

$('.showSection').on('change', function(){
    window.displayAttributes = [];
    $('.showSection:checkbox:checked').each(function () {
        if(this.checked){
            window.displayAttributes.push($(this).val());
        }
    });
});


$('.searchSection').on('change', function(){
    restrictSearchableAttributesArray = [];
    $('.searchSection:checkbox:checked').each(function () {
        if(this.checked){
            restrictSearchableAttributesArray.push($(this).val());
        }
    });
});


search.start();

