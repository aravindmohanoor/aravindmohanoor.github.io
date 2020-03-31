//Config
var applicationID = 'ZZ2ZTTMSBH';
var apiKey = '71090d1229c06a4d72829a3d0d59d6bc';
var index = 'papers_dev';

var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, index, {
    facets: ['journal','year'],
    facetingAfterDistinct: true,
    hitsPerPage: 50,
    restrictSearchableAttributes:['title']
});

helper.on('result', function (content) {
    renderFacetList(content); // not implemented yet
    renderHits(content);
});

function renderHits(content) {
    $('#container').html(function () {
        return $.map(content.hits, function (hit) {
            return '<li>' +
                '<p><b>'+
                hit._highlightResult.title.value +
                '</b></p>'
                +
                '<p>'+
                hit._highlightResult.abstract_excerpt.value +
                '</p>'
                +
                '</li>';
        });
    });
}

$('#facet-list').on('click', 'input[type=checkbox]', function (e) {
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
    $('#facet-list').html(function () {
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

helper.search();
