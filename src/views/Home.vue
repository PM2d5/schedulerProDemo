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
                // let eventStore = this.$refs.scheduler.schedulerInstance.eventStore;
                console.log(events);
            },
            
            // 关联工序的开始时间不能早于上一道工序的开始时间
            onDependencyAdd(records){
                console.log(records)
                let record = records.records[0];
                let lag = 0-record.fromEvent.duration;
                record.lag = lag;
                record.lagUnit = "day";
                let events = this.$refs.scheduler.schedulerInstance.eventStore.allRecords;
                let event = events.filter(item=>item.originalData.id == record.toEvent.id)[0];
                event.startDate = record.toEvent.startDate;
            }
        }
    } // eo export default

</script>

<!-- eof -->
