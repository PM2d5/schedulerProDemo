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
                
                let draggedEvent = events.filter(item=>item.id == context.draggedRecords[0].id)[0]; // 被拖拽工序

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
                        diffRowDependencies[i].lagUnit = "day"
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
                        context.endDate = DateHelper.add(context.startDate,draggedEvent.durationMS)
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
                        context.endDate = DateHelper.add(context.startDate,draggedEvent.durationMS)
                        pushTimes++;
                        console.log(2)
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
