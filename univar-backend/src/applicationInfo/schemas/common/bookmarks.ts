import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BookmarkRequest, UserInfo } from 'src/common';

export type BookmarksDocument = HydratedDocument<Bookmarks>;
export const BOOKMARK_MODEL_NAME = 'Bookmarks';

@Schema({ collection: 'bookmarks' })
export class Bookmarks {
  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  filters?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  columns?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  sort?: any;

  @Prop()
  panels?: string[];

  @Prop()
  type: string;

  @Prop()
  create_user: string;

  @Prop()
  access_group: string[];

  @Prop()
  is_default: boolean;

  @Prop()
  creation_date: Date;

  constructor(
    bookmarkRequest: BookmarkRequest,
    userInfo: UserInfo,
    existingBookmarks: Bookmarks = null,
  ) {
    const tempData = existingBookmarks || bookmarkRequest;

    this.filters = tempData.filters;
    this.columns = tempData.columns;
    this.sort = tempData.sort;
    this.panels = tempData.panels;
    this.type = tempData.type;
    this.create_user = existingBookmarks
      ? existingBookmarks.create_user
      : userInfo.preferred_username;
    const tempAccessGroup = [];
    // TODO handle the share group
    if (bookmarkRequest.is_share) {
      tempAccessGroup.push(this.create_user);
    } else {
      tempAccessGroup.push(this.create_user);
    }
    this.access_group = tempAccessGroup;
    this.is_default = false;
    this.name = tempData.name;
    this.creation_date = existingBookmarks
      ? existingBookmarks.creation_date
      : new Date();
  }
}

export const BookmarksSchema = SchemaFactory.createForClass(Bookmarks);
