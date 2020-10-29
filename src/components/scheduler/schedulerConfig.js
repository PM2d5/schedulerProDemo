/**
 *- Configuration for the scheduler
 */
import {SchedulerPro,DateHelper, EventStore, DependencyStore} from 'bryntum-schedulerpro';;

export default {

    minHeight        : '20em',
    startDate        : new Date(2020, 9, 27, 0),
    endDate          : new Date(2020, 9, 29, 0),
    // startDate  : '2020-03-23',
    // endDate    : '2020-03-24',
    // viewPreset       : 'hourAndDay',
    viewPreset                : {
        displayDateFormat : 'H:mm',
        tickWidth         : 25,
        shiftIncrement    : 1,
        shiftUnit         : 'WEEK',
        timeResolution    : {
            unit      : 'MINUTE',
            increment : 1
        },
        headers           : [
            {
                unit       : 'DAY',
                align      : 'center',
                dateFormat : 'ddd L'
            },
            {
                unit       : 'HOUR',
                align      : 'center',
                dateFormat : 'H'
            }
        ]
    },
    barMargin        : 5,
    rowHeight        : 50,
    multiEventSelect : true,
    zoomOnMouseWheel: false,
    zoomOnTimeAxisDoubleClick: false,
    // allowOverlap: false,
    

    features : {
        cellEdit  : false,
        // eventDrag : {
        //     constrainDragToResource : true
        // },
        eventDragCreate: false,
        dependencies: true,
        dependencyEdit: true,
        // nonWorkingTime : true,
        eventTooltip : {
            template : data => {
                const task = data.eventRecord;
                return `
                    ${task.name ? `<div class="b-sch-event-title">${task.name}</div>` : ''}
                    ${data.startClockHtml}
                    ${data.endClockHtml}
                    ${(task.dragValidationText || task.resizeValidationText) ? `<div class="restriction-title"><b>Restrictions:</b></div>
                    <ul class="restriction-list">
                        ${task.dragValidationText ? `<li>${task.dragValidationText}</li>` : ''}
                        ${task.resizeValidationText ? `<li>${task.resizeValidationText}</li>` : ''}
                    </ul>` : ''}
                `;
            }
        },
        eventDrag : {
            validatorFn({ draggedRecords, newResource }) {
                const
                    task    = draggedRecords[0],
                    isValid = task.type === 'Fixed' ||
                        // Only C-suite people can play Golf
                        (task.type === 'Golf' && ['CEO', 'CTO'].includes(newResource.role)) ||
                        // Tasks that have type defined cannot be assigned to another resource type
                        !(task.type && newResource.role !== task.resource.role);
                return {
                    valid   : newResource.available && isValid,
                    message : !newResource.available ? newResource.statusMessage : (!isValid ? task.dragValidationText : '')
                };
            },
        },
    },

    columns : [
        {
            text       : '工作中心 A',
            field      : 'name',
            htmlEncode : false,
            width      : 120,
            renderer   : ({ record }) => `<div class="color-box b-sch-${record.name.toLowerCase()}"></div>${record.name}`
        }
    ],

    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    },

    // timeAxis : {
    //     continuous : false,
    //     generateTicks(start, end, unit, increment) {
    //         // console.log(start,end,unit,increment)
    //         const ticks = [];
    //         while (start < end) {
    //             // 休息日的上班时间之前不能去掉
    //             if (start.getDate()!=28 || start.getHours()<8) {
    //                 ticks.push({
    //                     id        : ticks.length + 1,
    //                     startDate : start,
    //                     endDate   : DateHelper.add(start, increment, unit)
    //                 });
    //             }
    //             start = DateHelper.add(start, increment, unit);
    //         }
    //         return ticks;
    //     }
    // },

    listeners:{
        // beforeEventDropFinalize({context}){
            // console.log(EventStore)
            // let event = context.eventRecords;
            // console.log(context)
            // console.log("beforeEventDropFinalize:",context);
            // let diff = DateHelper.diff(event.startDate,event.endDate,"hour");
            // let temp = event.object;
            // event.object = {};
            // let date = context.startDate;
            // let originalDate = event.originalData.startDate;
            // for (let i=0;i<diff;i++){
            //     let tempData1 = DateHelper.add(date,i,"hour");
            //     let tempDate2 = DateHelper.add(originalDate,i,"hour");
            //     event.object[DateHelper.format(tempData1,"YYYY-MM-DD HH:mm")] = temp[DateHelper.format(tempDate2,"YYYY-MM-DD HH:mm")];
            // }
            // event.originalData = event.data;
            // console.log("new event:",event)
        // },
        // afterDependencyCreateDrop(data){
        //     console.log(data)
            
        // }
    }

} // eo schedulerConfig

// eof
