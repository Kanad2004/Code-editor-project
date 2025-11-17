package com.judge.workerservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class ExecutorConfig {

    @Value("${execution.max.concurrent:10}")
    private int maxConcurrent;

    @Value("${execution.queue.capacity:100}")
    private int queueCapacity;

    @Bean(name = "judgingExecutor")
    public Executor judgingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(maxConcurrent / 2);
        executor.setMaxPoolSize(maxConcurrent);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("judge-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
