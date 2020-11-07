/**
 *- Configuration for the scheduler
 */
import {SchedulerPro,DateHelper, EventStore, DependencyStore} from 'bryntum-schedulerpro';;
import moment from 'moment'


export default {

    minHeight        : '20em',
    // startDate        : moment().subtract(12,'hour').format("YYYY-MM-DD HH:mm"),
    // endDate          : moment().add(48,'hour').format("YYYY-MM-DD HH:mm"),
    startDate  : '2020-11-17 20:00',
    endDate    : '2020-11-20 08:00',
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
    rowHeight        : 70,
    multiEventSelect : true,
    zoomOnMouseWheel: false,
    zoomOnTimeAxisDoubleClick: false,
    // allowOverlap: false,
    

    features : {
        cellEdit  : false,
        // eventDrag : {
        //     constrainDragToResource : true
        // },
        scheduleContextMenu: {
            items: {
                addEvent: false
            },
        },
        
        eventDragCreate: false,
        dependencies: true,
        dependencyEdit: true,
        // nonWorkingTime : true,
        eventTooltip : {
            template : data => {
                const event = data.eventRecord;
                return `
                    <div>
                        <span class="b-sch-event-title">客户：</span>
                        <span>${event.client}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">规格：</span>
                        <span>${event.model}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">数量：</span>
                        <span>${event.num}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">批号：</span>
                        <span>${event.batchCode}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">车数：</span>
                        <span>${event.vanNum}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">交货日期：</span>
                        <span>${event.deliveryDate}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">产线：</span>
                        <span>${event.productLine}</span>
                    </div>
                    <div>
                        <span class="b-sch-event-title">准备时间：</span>
                        <span>${event.prepareTime}分钟</span>
                    </div>
                    ${data.startClockHtml}
                    ${data.endClockHtml}
                `;
            }
        },
        taskEdit :{
            items:{
                generalTab: {
                    items: {
                        nameField: false,
                        resourcesField: false,
                        percentDoneField: false
                    }
                },
                advancedTab: false,
                notesTab: false,
                predecessorsTab: false,
                successorsTab: false
            }
        }
        // eventDrag : {
        //     validatorFn({ draggedRecords, newResource }) {
        //         const
        //             task    = draggedRecords[0],
        //             isValid = task.type === 'Fixed' ||
        //                 // Only C-suite people can play Golf
        //                 (task.type === 'Golf' && ['CEO', 'CTO'].includes(newResource.role)) ||
        //                 // Tasks that have type defined cannot be assigned to another resource type
        //                 !(task.type && newResource.role !== task.resource.role);
        //         return {
        //             valid   : newResource.available && isValid,
        //             message : !newResource.available ? newResource.statusMessage : (!isValid ? task.dragValidationText : '')
        //         };
        //     },
        // },
    },

    columns : [
        {
            text       : '工作中心-挤出',
            field      : 'name',
            htmlEncode : false,
            width      : 115,
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
