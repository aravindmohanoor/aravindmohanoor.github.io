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

window.displayAttributes = ['title','section_text','abstract_excerpt','best_method_snippet','best_result_snippet'];

helper.on('result', function (content) {
    renderFacetList(content); // not implemented yet
    renderHits(content);
});

function renderHits(content) {
    $('#container').html(function () {
        return $.map(content.hits, function (hit) {
            var divHit = $('<div/>');
            divHit.addClass('verticalline');
            var liHit = $('<li/>');
            liHit.addClass('hitMargin');
            var pTitle = $('<p/>');
            var h4Title = $('<h4>',{
                html:hit._highlightResult.title.value
            });
            liHit.append(pTitle).append(h4Title);
            if (window.displayAttributes.indexOf('section_text') > -1){
                /*var pAbstract = $('<p>',{
                    html:hit._highlightResult.section_text.value
                });
                liHit.append(pAbstract);*/
                var h5SnippetTitle = $('<h5/>');
                var labelSnippetTitle = $('<span>',{
                    html:hit.section
                });
                h5SnippetTitle.append(labelSnippetTitle);
                labelSnippetTitle.addClass('badge badge-secondary');
                var pSnippetText = $('<p>',{
                    html:hit._highlightResult.section_text.value
                });
                liHit.append(h5SnippetTitle);
                liHit.append(pSnippetText);
            }
            if (window.displayAttributes.indexOf('best_method_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h5MethodTitle = $('<h5/>');
                    var labelMethodTitle = $('<span>',{
                        html:hit.best_method_title
                    });
                    h5MethodTitle.append(labelMethodTitle);
                    labelMethodTitle.addClass('badge badge-success');
                    var pMethodSnippet = $('<p>',{
                        html:hit._highlightResult.best_method_snippet.value
                    });
                    liHit.append(h5MethodTitle);
                    liHit.append(pMethodSnippet);
                }
            }
            if (window.displayAttributes.indexOf('best_result_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h5ResultTitle = $('<h5/>');
                    var labelResultTitle = $('<span>',{
                        html:hit.best_result_title
                    });
                    h5ResultTitle.append(labelResultTitle);
                    labelResultTitle.addClass('badge badge-primary');
                    var pResultSnippet = $('<p>',{
                        html:hit._highlightResult.best_result_snippet.value
                    });
                    liHit.append(h5ResultTitle);
                    liHit.append(pResultSnippet);
                }
            }
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
            return divHit;
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
