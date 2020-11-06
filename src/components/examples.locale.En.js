// import LocaleManager from '../../../lib/Core/localization/LocaleManager.js';
//<umd>
// import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import {LocaleHelper, LocaleManager} from 'bryntum-schedulerpro';
import En from './schedulerpro.locale.En';
import SharedEn from '../../_shared/locales/shared.locale.En.js';

const examplesEnLocale = LocaleHelper.mergeLocales(SharedEn, {

    extends : 'En',

    Button : {
        'Add column'    : 'Add column',
        'Remove column' : 'Remove column'
    },

    Column : {
        Capacity           : 'Capacity',
        City               : 'City',
        Company            : 'Company',
        Duration           : 'Duration',
        'Employment type'  : 'Employment type',
        End                : 'End',
        'First name'       : 'First name',
        Id                 : '#',
        Machines           : 'Machines',
        Name               : 'Name',
        'Nbr tasks'        : 'Nbr tasks',
        'Production line'  : 'Production line',
        Rating             : 'Rating',
        Role               : 'Role',
        Score              : 'Score',
        Staff              : 'Staff',
        Start              : 'Start',
        Surname            : 'Surname',
        'Task color'       : 'Task color',
        Type               : 'Type',
        'Unassigned tasks' : 'Unassigned tasks'
    },

    Combo : {
        'Group by' : 'Group by'
    },

    EventEdit : {
        Location : 'Location'
    },

    MenuItem : {
        'Custom header item' : 'Custom header item',
        'Custom cell action' : 'Custom cell action'
    },

    Slider : {
        'Font size' : 'Font size'
    }
});

LocaleHelper.publishLocale('En', En);
LocaleHelper.publishLocale('EnExamples', examplesEnLocale);

export default examplesEnLocale;
//</umd>

LocaleManager.extendLocale('En', examplesEnLocale);
