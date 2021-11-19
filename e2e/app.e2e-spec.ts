import { PracticeABPTemplatePage } from './app.po';

describe('PracticeABP App', function() {
  let page: PracticeABPTemplatePage;

  beforeEach(() => {
    page = new PracticeABPTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
