import type { AbstractIntlMessages } from 'next-intl';

import adminVi from '../messages/admin/vi.json';
import adminEn from '../messages/admin/en.json';
import pagesVi from '../messages/pages/vi.json';
import pagesEn from '../messages/pages/en.json';
import legalVi from '../messages/legal/vi.json';
import legalEn from '../messages/legal/en.json';
import integrationsVi from '../messages/integrations/vi.json';
import integrationsEn from '../messages/integrations/en.json';
import architectureVi from '../messages/architecture/vi.json';
import architectureEn from '../messages/architecture/en.json';

import vi01 from '../messages/about/vi/01.json';
import vi02 from '../messages/about/vi/02.json';
import vi03 from '../messages/about/vi/03.json';
import vi04 from '../messages/about/vi/04.json';
import vi05 from '../messages/about/vi/05.json';
import vi06 from '../messages/about/vi/06.json';
import vi07 from '../messages/about/vi/07.json';
import vi08 from '../messages/about/vi/08.json';
import vi09 from '../messages/about/vi/09.json';

import en01 from '../messages/about/en/01.json';
import en02 from '../messages/about/en/02.json';
import en03 from '../messages/about/en/03.json';
import en04 from '../messages/about/en/04.json';
import en05 from '../messages/about/en/05.json';
import en06 from '../messages/about/en/06.json';
import en07 from '../messages/about/en/07.json';
import en08 from '../messages/about/en/08.json';
import en09 from '../messages/about/en/09.json';

type BaseMessages = Record<string, unknown>;
type AboutPart = Record<string, unknown>;

const VI_ABOUT_PARTS: AboutPart[] = [vi01, vi02, vi03, vi04, vi05, vi06, vi07, vi08, vi09];
const EN_ABOUT_PARTS: AboutPart[] = [en01, en02, en03, en04, en05, en06, en07, en08, en09];

function mergeAboutParts(parts: AboutPart[]): AboutPart {
  return parts.reduce((acc, p) => ({ ...acc, ...p }), {});
}

export async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const loc = locale === 'en' ? 'en' : 'vi';
  const baseModule =
    loc === 'en' ? await import('../messages/en.json') : await import('../messages/vi.json');
  const base = baseModule.default as BaseMessages;
  const aboutExtra = mergeAboutParts(loc === 'en' ? EN_ABOUT_PARTS : VI_ABOUT_PARTS);
  const adminExtra = (loc === 'en' ? adminEn : adminVi) as BaseMessages;
  const pagesExtra = (loc === 'en' ? pagesEn : pagesVi) as BaseMessages;
  const legalExtra = (loc === 'en' ? legalEn : legalVi) as BaseMessages;
  const integrationsExtra = (loc === 'en' ? integrationsEn : integrationsVi) as BaseMessages;
  const architectureExtra = (loc === 'en' ? architectureEn : architectureVi) as BaseMessages;

  return {
    ...base,
    ...adminExtra,
    ...pagesExtra,
    ...legalExtra,
    ...integrationsExtra,
    ...architectureExtra,
    aboutPage: {
      ...((base.aboutPage as BaseMessages) ?? {}),
      ...aboutExtra,
    },
  } as AbstractIntlMessages;
}
