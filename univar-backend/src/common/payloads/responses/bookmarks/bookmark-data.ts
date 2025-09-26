import { Bookmarks } from 'src/applicationInfo';

export class BookmarkData {
  _id?: string;

  filters?: any;

  columns?: string[];

  type: string;

  name?: string;

  sort?: string;

  panels?: string[];

  is_default?: boolean;

  constructor(bookmarks: Bookmarks) {
    this._id = (<any>bookmarks)._id.toString();

    this.name = bookmarks.name;

    this.filters = bookmarks.filters;

    this.columns = bookmarks.columns;

    this.type = bookmarks.type;

    this.sort = bookmarks.sort;

    this.panels = bookmarks.panels;

    this.is_default = bookmarks.is_default;
  }
}
