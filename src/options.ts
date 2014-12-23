/// <reference path="./module.ts" />
module sun.table {
  SunTableModule.constant('SunTableTemplates', {
    prefix: '',
    pagination: {
      footer: 'pagination/partials/footer.html',
      pagination: 'pagination/partials/pagination.html',
      rowsPerPage: 'pagination/partials/rows-per-page.html'
    },
    filter: {
      select: 'filter/partials/select.html',
      text: 'filter/partials/text.html'
    }
  });
}