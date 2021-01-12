<!--
 * Home component
 -->

<template>
    <div class="home">
        <scheduler
            ref="scheduler"
            :config="schedulerConfig"
        />
        <button @click="test"></button>
    </div>
</template>

<script>
    // @ is an alias to /src
    // import Scheduler from 'bryntum-vue-shared/src/Scheduler.vue';
    import Scheduler from '../components/_vue_shared/src/Scheduler';
    import schedulerConfig from '@/components/scheduler/schedulerConfig.js';
    import {DateHelper, LocaleManager} from 'bryntum-schedulerpro';
    import moment, { duration } from 'moment'
    import Ru from '../components/schedulerpro.locale.En'

    const modelAndLine = [
        {model: "0536-J1-DF",productLine: "2#",capacity: 1000},
        {model: "0536-J1-DF",productLine: "3#",capacity: 750},
        {model: "0536-J1-DF",productLine: "5#",capacity: 600},
        {model: "0536-J1-DF",productLine: "11#",capacity: 450},

        {model: "7002-DF(JR-70)",productLine: "2#",capacity: 600},
        {model: "7002-DF(JR-70)",productLine: "3#",capacity: 800},
        {model: "7002-DF(JR-70)",productLine: "6#",capacity: 950},
        {model: "7002-DF(JR-70)",productLine: "10#",capacity: 1050},
        {model: "7002-DF(JR-70)",productLine: "11#",capacity: 900},
        {model: "7002-DF(JR-70)",productLine: "12#",capacity: 1250},

        {model: "R2I-00030(91A)",productLine: "11#",capacity: 550},
        {model: "R2I-00030(91A)",productLine: "12#",capacity: 675},
        {model: "R2I-00030(91A)",productLine: "21#",capacity: 750},
        {model: "R2I-00030(91A)",productLine: "22#",capacity: 425},

        {model: "R2I-00027(91A)",productLine: "2#",capacity: 600},
        {model: "R2I-00027(91A)",productLine: "6#",capacity: 450},
        {model: "R2I-00027(91A)",productLine: "10#",capacity: 600},
        {model: "R2I-00027(91A)",productLine: "21#",capacity: 675},
        {model: "R2I-00027(91A)",productLine: "22#",capacity: 750},

        {model: "7001-DF(DSCL02-0009)",productLine: "6#",capacity: 1050},
        {model: "7001-DF(DSCL02-0009)",productLine: "10#",capacity: 900},
        {model: "7001-DF(DSCL02-0009)",productLine: "11#",capacity: 1250},
        {model: "7001-DF(DSCL02-0009)",productLine: "12#",capacity: 675},

        {model: "TY-202",productLine: "2#",capacity: 1250},
        {model: "TY-202",productLine: "12#",capacity: 1400},

        {model: "V-90-LF(耐晒等级8级)",productLine: "3#",capacity: 600},
        {model: "V-90-LF(耐晒等级8级)",productLine: "5#",capacity: 675},
        {model: "V-90-LF(耐晒等级8级)",productLine: "6#",capacity: 750},
        {model: "V-90-LF(耐晒等级8级)",productLine: "10#",capacity: 1050},

        {model: "J-70",productLine: "2#",capacity: 800},
        {model: "J-70",productLine: "3#",capacity: 950},
        {model: "J-70",productLine: "5#",capacity: 1050},
        {model: "J-70",productLine: "6#",capacity: 900},
        {model: "J-70",productLine: "10#",capacity: 600},
        {model: "J-70",productLine: "11#",capacity: 675},
        {model: "J-70",productLine: "12#",capacity: 750},
        {model: "J-70",productLine: "21#",capacity: 1050},
        {model: "J-70",productLine: "22#",capacity: 500},

        {model: "7029",productLine: "12#",capacity: 900},
        {model: "7029",productLine: "21#",capacity: 1200}
    ];

    const colors = ['red','pink','purple','violet','indigo','blue','cyan','green','lime','yellow','orange','deep-orange','gantt-green'];
    // export home view
    export default {
        name: 'home',
        data() {
            return {
                schedulerConfig,
                modelAndLine,
                colors,
                storedOriginalColors : false,
                storedOriginalStyles : false
            }
        },
        components: {
            Scheduler
        }, // eo components

        mounted() {
            this.$store.subscribe(this.handleMutation)

            LocaleManager.locale = Ru;

            const scheduler = this.$refs.scheduler.schedulerInstance;

            scheduler.dependencyStore.on({
                add: this.onDependencyAdd
            })

            // scheduler.on('eventDrop',this.onEventDrop);
            scheduler.on({
                eventDrop: this.onEventDrop,
            })

            // 初始化events位置
            setTimeout(()=>{
                let timeAxis = this.$refs.scheduler.schedulerInstance.timeAxis;
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                console.log("events",events);
                console.log("timeAxis",timeAxis);
                let resources = this.$refs.scheduler.schedulerInstance.resourceStore.allRecords;
                console.log("resources",resources);
                for (let i in resources){
                    let eventArr = events.filter(o=>o.resourceId==resources[i].id);
                    if (eventArr.length == 0){
                        continue;
                    }
                    // 按照交货时间反向排序,交货时间晚的放在甘特图的最后
                    eventArr.sort((b,a)=>DateHelper.compare(DateHelper.parse(a.deliveryDate,'YYYY-MM-DD'),DateHelper.parse(b.deliveryDate,'YYYY-MM-DD')));
                    let endDate = timeAxis.endDate;
                    // let startDate = timeAxis.startDate;
                    for (let j in eventArr){
                        eventArr[j].name = eventArr[j].client+" "+eventArr[j].model;
                        eventArr[j].eventColor = colors[Math.floor(Math.random()*colors.length)];
                        let match = this.modelAndLine.find(o=>o.productLine==eventArr[j].productLine&&o.model==eventArr[j].model);
                        // console.log("match",match)
                        let duration;
                        if (match!=null){
                            duration = eventArr[j].num/match.capacity;
                            duration = Math.round(duration*100,2)/100;
                            if (eventArr[j].startDate==null){
                                // 没有默认开始时间，带排产的工序
                                eventArr[j].startDate = DateHelper.add(endDate,-duration,"hour");
                                eventArr[j].endDate = endDate;
                                endDate = DateHelper.add(eventArr[j].startDate,-eventArr[j].prepareTime,"minute");
                            } else {
                                // 有默认开始时间的，无法拖动修改时长
                                eventArr[j].duration = duration;
                                eventArr[j].draggable = false;
                                eventArr[j].resizable = false;
                                eventArr[j].taskEditable = false;
                                eventArr[j].eventColor = "gray";
                            }
                            
                        } else {
                            duration = 0;
                            eventArr[j].startDate = DateHelper.add(endDate,-1,"hour");
                            eventArr[j].endDate = eventArr[j].startDate;
                            endDate = DateHelper.add(eventArr[j].startDate,-1,'hour');
                        }
                        // console.log("duration",duration)
                        // console.log(eventArr[j]);
                    }
                }
            },1000)
        },
        methods : {
            handleMutation(mutation) {
                this[mutation.type](mutation.payload);
            },

            setEventColor(color) {
                const eventStore = this.$refs.scheduler.schedulerInstance.eventStore;

                eventStore.forEach(eventRecord => {
                    if (!this.storedOriginalColors) {
                        eventRecord.originalColor = eventRecord.eventColor;
                    }

                    if (color === 'mixed') {
                        eventRecord.eventColor = eventRecord.originalColor;
                    }
                    else {
                        eventRecord.eventColor = color;
                    }
                });

                this.storedOriginalColors = true;

            }, // eo function setEventColor

            setEventStyle(style) {
                const eventStore = this.$refs.scheduler.schedulerInstance.eventStore;

                eventStore.forEach(eventRecord => {
                    if (!this.storedOriginalStyles) {
                        eventRecord.originalStyle = eventRecord.eventStyle;
                    }

                    if (style === 'mixed') {
                        eventRecord.eventStyle = eventRecord.originalStyle;
                    }
                    else {
                        eventRecord.eventStyle = style;
                    }
                });

                this.storedOriginalStyles = true;

            }, // eo function setEventStyle
            test(){
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                let eventStore = this.$refs.scheduler.schedulerInstance.eventStore;
                let dependencies = this.$refs.scheduler.schedulerInstance.dependencyStore;
                let timeAxis = this.$refs.scheduler.schedulerInstance.timeAxis;
                console.log(events);
            },

            // 关联工序的开始时间不能早于上一道工序的开始时间
            onDependencyAdd({records}){
                // console.log("records",records)
                let record = records[0];
                let lag = 0-record.fromEvent.duration;
                record.lag = lag;
                record.lagUnit = "hour";
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                let event = events.filter(item=>item.id == record.toEvent.id)[0];
                event.startDate = record.toEvent.startDate;
            },
            // 拖拽工序重叠时，放在上道工序+准备时间之后
            onEventDrop({context}){
                console.log("context",context)
                let timeAxis = this.$refs.scheduler.schedulerInstance.timeAxis;
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                let dependencies = this.$refs.scheduler.schedulerInstance.dependencyStore.allRecords;
                let eventsSameRes = events.filter(item=>item.resources[0].id == context.newResource.id); // 同一行的event
                let resources = this.$refs.scheduler.schedulerInstance.resourceStore.allRecords;
                let draggedEvent = events.filter(item=>item.id == context.draggedRecords[0].id)[0]; // 被拖拽工序
                let oldDuration = draggedEvent.duration;
                // ***********如果拖动到新的插线，根据产能重新计算新的时长*********
                if (context.resourceRecord.id != context.newResource.id){
                    let match = this.modelAndLine.find(o=>o.model==draggedEvent.model&&o.productLine==context.newResource.name);
                    draggedEvent.productLine = context.newResource.name;
                    if (match!=null){
                        let newDuration = Math.round(draggedEvent.num/match.capacity*100,2)/100;
                        draggedEvent.duration = newDuration;
                        console.log("newDuration",newDuration)
                    } else { // 灭有匹配的产能，时长设为0
                        draggedEvent.duration = 0;
                    }
                }
                //**************end***************

                // 将同行有关联的工序的lag设置为准备时间，不同行的lag还是改为上道工序的duration
                let sameRowDependencies = dependencies.filter(item=>item.fromEvent.resourceId==item.toEvent.resourceId);
                let diffRowDependencies = dependencies.filter(item=>item.fromEvent.resourceId!=item.toEvent.resourceId);
                if (sameRowDependencies.length>0){
                    for (let i in sameRowDependencies){
                        sameRowDependencies[i].lag = sameRowDependencies[i].toEvent.prepareTime;
                        sameRowDependencies[i].lagUnit = "minute"
                    }
                }
                if (diffRowDependencies.length>0){
                    for (let i in diffRowDependencies){
                        diffRowDependencies[i].lag = 0 - diffRowDependencies[i].fromEvent.duration;
                        diffRowDependencies[i].lagUnit = "hour"
                    }
                }
                eventsSameRes.sort((a,b)=>DateHelper.compare(a.startDate,b.startDate)); // 按时间正向排序
                let pushTimes = 0;  // 往右推的次数
                for (let i in eventsSameRes){
                    // 去掉自己
                    if (eventsSameRes[i].id == draggedEvent.id){
                        continue;
                    }

                    let endPlusPrepare = DateHelper.add(eventsSameRes[i].endDate,draggedEvent.prepareTime?draggedEvent.prepareTime:0,'minutes')
                    let startMinusPrepare = DateHelper.add(eventsSameRes[i].startDate,eventsSameRes[i].prepareTime?-eventsSameRes[i].prepareTime:0,'minutes')
                    let dragRowDependencies = sameRowDependencies.filter(item=>item.fromEvent.resourceId==context.newResource.id);
                    if (DateHelper.intersectSpans(context.startDate,context.endDate,pushTimes>0?startMinusPrepare:eventsSameRes[i].startDate,endPlusPrepare)){
                        // 如果是上下级，不做判断（因为是自动的）
                        if (sameRowDependencies.length>0){
                            
                            let isSame = false;
                            if (dragRowDependencies.length>0){
                                for (let j in dragRowDependencies){
                                    if (dragRowDependencies[j].from == draggedEvent.id && dragRowDependencies[j].to == eventsSameRes[i].id
                                    || dragRowDependencies[j].to == draggedEvent.id && dragRowDependencies[j].from == eventsSameRes[i].id){
                                        console.log('same')
                                        isSame = true;
                                        continue;
                                    }
                                }
                                if(isSame){
                                    continue;
                                }
                            }
                        }
                        draggedEvent.startDate = endPlusPrepare;
                        context.startDate = endPlusPrepare;
                        context.endDate = DateHelper.add(context.startDate,draggedEvent.duration,'hours')
                        pushTimes++;
                        console.log(1)
                    } 
                    else if (DateHelper.intersectSpans(draggedEvent.startDate,draggedEvent.endDate,startMinusPrepare,endPlusPrepare)){
                        // 关联工序自动改变位置的情况，draggedEvent是自动改变后的位置
                        if(dependencies.length>0){
                            // 如果被拖拽工序不是关联工序，不做下面的判断
                            let temp = dependencies.filter(item=>item.to == draggedEvent.id);
                            if (temp.length==0){
                                continue;
                            }
                        } else {
                            continue;
                        }
                        draggedEvent.startDate = endPlusPrepare;
                        context.startDate = endPlusPrepare;
                        context.endDate = DateHelper.add(context.startDate,draggedEvent.duration,'hours')
                        pushTimes++;
                        console.log(2)
                    }
                    // 如果开始时间大于时间范围的结束时间，恢复到原来的位置
                    if (DateHelper.compare(draggedEvent.startDate,timeAxis.endDate)>0){ 
                        draggedEvent.startDate = context.origStart;
                        draggedEvent.duration = oldDuration;
                        draggedEvent.resource = resources.find(o=>o.id==context.resourceRecord.id);
                        draggedEvent.productLine = draggedEvent.resource.name;
                        console.log("draggedEvent",draggedEvent)
                    }
                    
                }
                if (pushTimes>0){   // push和pull只能有一种
                    return;
                }
                eventsSameRes.sort((a,b)=>DateHelper.compare(b.startDate,a.startDate)); // 按时间反向排序
                let pullTimes = 0;  // 往回拉的次数
                for (let i in eventsSameRes){
                    // 去掉自己
                    if (eventsSameRes[i].id == draggedEvent.id){
                        continue;
                    }
                    let endPlusPrepare = DateHelper.add(eventsSameRes[i].endDate,draggedEvent.prepareTime?draggedEvent.prepareTime:0,'minutes')
                    let startMinusPrepare = DateHelper.add(eventsSameRes[i].startDate,eventsSameRes[i].prepareTime?-eventsSameRes[i].prepareTime:0,'minutes')
                    if (pullTimes == 0){ // 第一次只要判断被拖拽工序的结束时间是否在重叠工序的准备时间以内
                        if (DateHelper.betweenLesser(context.endDate,startMinusPrepare,eventsSameRes[i].startDate)){
                            draggedEvent.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.duration,'hours');
                            context.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.duration,'hours');
                            context.endDate = DateHelper.add(context.startDate,draggedEvent.duration,'hours')
                            pullTimes++;
                        }
                    } else { // 第二次以后要判断重叠工序的结束时间是否在被拖拽工序的准备时间以内，是的话还是往回拉
                        if (DateHelper.intersectSpans(context.startDate,context.endDate,eventsSameRes[i].startDate,endPlusPrepare)){
                            draggedEvent.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.duration,'hours');
                            context.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.duration,'hours');
                            context.endDate = DateHelper.add(context.startDate,draggedEvent.duration,'hours')
                            pullTimes++;
                        }
                    }
                    // 如果结束时间小于时间范围的开始时间，恢复到原来的位置
                    if (DateHelper.compare(draggedEvent.endDate,timeAxis.startDate)<0){ 
                        draggedEvent.startDate = context.origStart;
                        draggedEvent.duration = oldDuration;
                        draggedEvent.resource = resources.find(o=>o.id==context.resourceRecord.id);
                        draggedEvent.productLine = draggedEvent.resource.name;
                        console.log("draggedEvent",draggedEvent)
                    }
                }
            }
        }
    } // eo export default

</script>

<style>
.b-sch-event-wrap.b-drag-invalid .b-sch-event {
  background-color: red !important;
}
.b-sch-tip-invalid .b-sch-tip-message:not(:empty):before {
  margin-right: 0.5em;
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  color: red;
  content: "\F071";
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}
.b-grid-subgrid.b-grid-subgrid-normal.b-grid-horizontal-scroller.b-widget.b-subgrid.b-resize-monitored.b-widget-scroller.b-timeline-subgrid{
    background-image: none !important;
}
</style>

<!-- eof -->
