import { Bookmarks } from 'src/applicationInfo';
import { BookmarkRequest, BookmarkType, UserInfo } from 'src/common';
import { S_TEAM_USERINFO } from '../../../mock';

describe('Bookmarks', () => {
  describe('constructor', () => {
    const bookmarkRequest: BookmarkRequest = <any>{
      name: 'Bookmark',
      filters: {
        sv_type: 'BND',
        variant_type: 'structural',
      },
      columns: {
        all: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'gene_symbol',
            'samples_genotypes',
            'hgvsc',
            'hgvsp',
            'quality',
            'impact',
            'existing_variation',
            'mane_select',
            'revel',
            'gnomad_af',
            'gnomad_afr_af',
            'gnomad_amr_af',
            'gnomad_eas_af',
            'gnomad_nfe_af',
            'gnomad_sas_af',
            'gnomadv3_af',
            'gnomadv3_af_afr',
            'gnomadv3_af_amr',
            'gnomadv3_af_eas',
            'gnomadv3_af_nfe',
            'gnomadv3_af_sas',
            'constraint_mis_z',
            'constraint_oe_lof_upper',
            'clnsig',
            'clnsigconf',
            'clnid',
            'cgd_agegroup',
            'cgd_inheritance',
            'cgd_manifestationcategories',
            'exomiser_ad_exgenescombi',
            'exomiser_ar_exgenescombi',
            'exomiser_xd_exgenescombi',
            'exomiser_xr_exgenescombi',
            'exomiser_mt_exgenescombi',
          ],
        },
        small: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'samples_genotypes',
            'gene_symbol',
            'mane_select',
            'gnomad_af',
            'gnomad_afr_af',
            'gnomad_amr_af',
            'gnomad_eas_af',
            'gnomad_nfe_af',
            'gnomad_sas_af',
            'constraint_mis_z',
            'existing_variation',
            'hgvsc',
            'hgvsp',
            'quality',
            'impact',
            'revel',
            'constraint_oe_lof_upper',
            'cgd_agegroup',
            'cgd_inheritance',
            'cgd_manifestationcategories',
            'gnomadv3_af',
            'gnomadv3_af_afr',
            'gnomadv3_af_amr',
            'gnomadv3_af_eas',
            'gnomadv3_af_nfe',
            'gnomadv3_af_sas',
            'clnsig',
            'clnsigconf',
            'clnid',
            'exomiser_ad_exgenescombi',
            'exomiser_ar_exgenescombi',
            'exomiser_mt_exgenescombi',
            'exomiser_xd_exgenescombi',
            'exomiser_xr_exgenescombi',
          ],
        },
        structural: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'samples_genotypes',
            'gene_symbol',
            'len',
            'source',
            'mane_select',
            'pathogenic',
          ],
        },
      },
      sort: {
        gene_symbol: -1,
      },
      panels: ['paneluk_111', 'paneluk_114', 'paneluk_115'],
      type: BookmarkType.bookmark,
      is_share: false,
    };

    const existingBookmarks = {
      name: 'Existing Bookmark',
      filters: {
        sv_type: 'BND',
        variant_type: 'structural',
      },
      columns: {
        all: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'gene_symbol',
            'samples_genotypes',
            'hgvsc',
            'hgvsp',
            'quality',
            'impact',
            'existing_variation',
            'mane_select',
            'revel',
            'gnomad_af',
            'gnomad_afr_af',
            'gnomad_amr_af',
            'gnomad_eas_af',
            'gnomad_nfe_af',
            'gnomad_sas_af',
            'gnomadv3_af',
            'gnomadv3_af_afr',
            'gnomadv3_af_amr',
            'gnomadv3_af_eas',
            'gnomadv3_af_nfe',
            'gnomadv3_af_sas',
            'constraint_mis_z',
            'constraint_oe_lof_upper',
            'clnsig',
            'clnsigconf',
            'clnid',
            'cgd_agegroup',
            'cgd_inheritance',
            'cgd_manifestationcategories',
            'exomiser_ad_exgenescombi',
            'exomiser_ar_exgenescombi',
            'exomiser_xd_exgenescombi',
            'exomiser_xr_exgenescombi',
            'exomiser_mt_exgenescombi',
          ],
        },
        small: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'samples_genotypes',
            'gene_symbol',
            'mane_select',
            'gnomad_af',
            'gnomad_afr_af',
            'gnomad_amr_af',
            'gnomad_eas_af',
            'gnomad_nfe_af',
            'gnomad_sas_af',
            'constraint_mis_z',
            'existing_variation',
            'hgvsc',
            'hgvsp',
            'quality',
            'impact',
            'revel',
            'constraint_oe_lof_upper',
            'cgd_agegroup',
            'cgd_inheritance',
            'cgd_manifestationcategories',
            'gnomadv3_af',
            'gnomadv3_af_afr',
            'gnomadv3_af_amr',
            'gnomadv3_af_eas',
            'gnomadv3_af_nfe',
            'gnomadv3_af_sas',
            'clnsig',
            'clnsigconf',
            'clnid',
            'exomiser_ad_exgenescombi',
            'exomiser_ar_exgenescombi',
            'exomiser_mt_exgenescombi',
            'exomiser_xd_exgenescombi',
            'exomiser_xr_exgenescombi',
          ],
        },
        structural: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'samples_genotypes',
            'gene_symbol',
            'len',
            'source',
            'mane_select',
            'pathogenic',
          ],
        },
      },
      sort: {
        gene_symbol: -1,
      },
      panels: ['paneluk_111', 'paneluk_114', 'paneluk_115'],
      type: BookmarkType.filter,
      create_user: 'existing user',
      access_group: ['existing user'],
      is_default: false,
      creation_date: new Date(),
    };
    const userInfo: UserInfo = S_TEAM_USERINFO;

    it('should create a new Bookmarks instance with default values', () => {
      const bookmark = new Bookmarks(bookmarkRequest, userInfo);

      expect(bookmark.name).toBe(bookmarkRequest.name);
      expect(bookmark.filters).toBe(bookmarkRequest.filters);
      expect(bookmark.columns).toBe(bookmarkRequest.columns);
      expect(bookmark.sort).toBe(bookmarkRequest.sort);
      expect(bookmark.panels).toBe(bookmarkRequest.panels);
      expect(bookmark.type).toBe(bookmarkRequest.type);
      expect(bookmark.create_user).toBe(userInfo.preferred_username);
      expect(bookmark.access_group).toEqual([userInfo.preferred_username]);
      expect(bookmark.is_default).toBe(false);
      expect(bookmark.creation_date).toBeInstanceOf(Date);
    });

    it('should create a new Bookmarks instance with existing bookmark values', () => {
      const bookmark = new Bookmarks(
        { ...bookmarkRequest, is_share: true },
        userInfo,
        existingBookmarks,
      );

      expect(bookmark.name).toBe(existingBookmarks.name);
      expect(bookmark.filters).toBe(existingBookmarks.filters);
      expect(bookmark.columns).toBe(existingBookmarks.columns);
      expect(bookmark.sort).toBe(existingBookmarks.sort);
      expect(bookmark.panels).toBe(existingBookmarks.panels);
      expect(bookmark.type).toBe(existingBookmarks.type);
      expect(bookmark.create_user).toBe(existingBookmarks.create_user);
      expect(bookmark.access_group).toEqual(existingBookmarks.access_group);
      expect(bookmark.is_default).toBe(false);
      expect(bookmark.creation_date).toEqual(existingBookmarks.creation_date);
    });
  });
});
