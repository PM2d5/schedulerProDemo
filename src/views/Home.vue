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
    import {DateHelper} from 'bryntum-schedulerpro';;

    // export home view
    export default {
        name: 'home',
        data() {
            return {
                schedulerConfig,
                storedOriginalColors : false,
                storedOriginalStyles : false
            }
        },
        components: {
            Scheduler
        }, // eo components

        mounted() {
            this.$store.subscribe(this.handleMutation)

            const scheduler = this.$refs.scheduler.schedulerInstance;

            scheduler.dependencyStore.on({
                add: this.onDependencyAdd
            })

            // scheduler.on('eventDrop',this.onEventDrop);
            scheduler.on({
                eventDrop: this.onEventDrop,
                prio: -1
            })
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
                console.log(dependencies);
            },

            // 关联工序的开始时间不能早于上一道工序的开始时间
            onDependencyAdd({records}){
                // console.log("records",records)
                let record = records[0];
                let lag = 0-record.fromEvent.duration;
                record.lag = lag;
                record.lagUnit = "day";
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                let event = events.filter(item=>item.id == record.toEvent.id)[0];
                event.startDate = record.toEvent.startDate;
            },
            // 拖拽工序重叠时，放在上道工序+准备时间之后
            onEventDrop({context}){
                console.log("context",context)
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                let dependencies = this.$refs.scheduler.schedulerInstance.dependencyStore.allRecords;
                let eventsSameRes = events.filter(item=>item.resourceId == context.newResource.id); // 同一行的event
                eventsSameRes.sort((a,b)=>DateHelper.compare(a.startDate,b.startDate)); // 按时间正向排序
                let draggedEvent = events.filter(item=>item.id == context.draggedRecords[0].id)[0]; // 被拖拽工序
                // 如果被拖拽工序存在关联工序，获取与它同行的上一级和下一级
                let temp = dependencies.filter(item=>item.to == draggedEvent.id);
                let previousEvents = []; // 同一行的上一级工序
                if (temp.length>0){
                    for (let i in temp){
                        previousEvents.push(events.filter(item=>item.id == temp[i].from && item.resourceId == context.newResource.id));
                    }
                }
                temp = dependencies.filter(item=>item.from == draggedEvent.id);
                let nextEvents = []; // 下同一行的一级工序
                if (temp.length>0){
                    for (let i in temp){
                        nextEvents.push(events.filter(item=>item.id == temp[i].to && item.resourceId == context.newResource.id))
                    }
                }
                console.log("previous",previousEvents);
                console.log("next",nextEvents);


                let pushTimes = 0;  // 往右推的次数
                for (let i in eventsSameRes){
                    // 去掉自己
                    if (eventsSameRes[i].id == draggedEvent.id){
                        continue;
                    }
                    let endPlusPrepare = DateHelper.add(eventsSameRes[i].endDate,draggedEvent.prepareTime?draggedEvent.prepareTime:0,'minutes')
                    let startMinusPrepare = DateHelper.add(eventsSameRes[i].startDate,eventsSameRes[i].prepareTime?-eventsSameRes[i].prepareTime:0,'minutes')
                    if (DateHelper.intersectSpans(context.startDate,context.endDate,pushTimes>0?startMinusPrepare:eventsSameRes[i].startDate,endPlusPrepare)){
                        draggedEvent.startDate = endPlusPrepare;
                        context.startDate = endPlusPrepare;
                        context.endDate = DateHelper.add(context.startDate,draggedEvent.durationMS)
                        pushTimes++;
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
                            draggedEvent.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.durationMS);
                            context.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.durationMS);
                            context.endDate = DateHelper.add(context.startDate,draggedEvent.durationMS)
                            // console.log(context.startDate,context.endDate)
                            pullTimes++;
                        }
                    } else { // 第二次以后要判断重叠工序的结束时间是否在被拖拽工序的准备时间以内，是的话还是往回拉
                        if (DateHelper.intersectSpans(context.startDate,context.endDate,eventsSameRes[i].startDate,endPlusPrepare)){
                            draggedEvent.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.durationMS);
                            context.startDate = DateHelper.add(startMinusPrepare,-draggedEvent.durationMS);
                            context.endDate = DateHelper.add(context.startDate,draggedEvent.durationMS)
                            pullTimes++;
                        }
                    }
                }
            }
        }
    } // eo export default

</script>

<!-- eof -->
