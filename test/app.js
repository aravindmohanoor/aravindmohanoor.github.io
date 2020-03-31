//Config
var applicationID = 'ZZ2ZTTMSBH';
var apiKey = '71090d1229c06a4d72829a3d0d59d6bc';
var index = 'papers_dev';

var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, index, {
    facets: ['journal','year'],
    facetingAfterDistinct: true,
    hitsPerPage: 50
});

window.displayAttributes = ['title','abstract_excerpt','best_method_snippet'];

helper.on('result', function (content) {
    renderFacetList(content); // not implemented yet
    renderHits(content);
});

function renderHits(content) {
    $('#container').html(function () {
        return $.map(content.hits, function (hit) {
            var liHit = $('<li/>');
            var pTitle = $('<p/>');
            var h4Title = $('<h4>',{
                html:hit._highlightResult.title.value
            });
            liHit.append(pTitle).append(h4Title);
            if (window.displayAttributes.indexOf('abstract_excerpt') > -1){
                var pAbstract = $('<p>',{
                    html:hit._highlightResult.abstract_excerpt.value
                });
                liHit.append(pAbstract);
            }
            if (window.displayAttributes.indexOf('best_method_snippet') > -1){
                //<span class="label label-default">Default Label</span>
                if(hit.best_method_title !== ''){
                    var h5MethodTitle = $('<h5/>');
                    var labelMethodTitle = $('<span>',{
                        html:hit.best_method_title
                    });
                    h5MethodTitle.append(labelMethodTitle);
                    labelMethodTitle.addClass('badge badge-secondary');
                    var pMethodSnippet = $('<p>',{
                        html:hit._highlightResult.best_method_snippet.value
                    });
                    liHit.append(h5MethodTitle);
                    liHit.append(pMethodSnippet);
                }
            }
            return liHit;
        });
    });
}

$('#journal-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('journal', facetValue).
    search();
});

$('#year-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('year', facetValue).
    search();
});

function renderFacetList(content) {
    $('#journal-facet').html(function () {
        return $.map(content.getFacetValues('journal'), function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#year-facet').html(function () {
        return $.map(content.getFacetValues('year'), function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
}

$('#search-box').on('keyup', function () {
    helper.setQuery($(this).val()).
    search();
});

$('.section-search').on('change', function(){
    //get all checked boxes
    restrictSearchableAttributesArray = [];
    $('.section-search:checkbox:checked').each(function () {
        if(this.checked){
            restrictSearchableAttributesArray.push($(this).val());
        }
    });
    helper.setQueryParameter('restrictSearchableAttributes', restrictSearchableAttributesArray).search();
});

$('.section-display').on('change', function(){
    //get all checked boxes
    window.displayAttributes = [];
    $('.section-display:checkbox:checked').each(function () {
        if(this.checked){
            window.displayAttributes.push($(this).val());
        }
    });
    helper.search();
});

helper.search();
