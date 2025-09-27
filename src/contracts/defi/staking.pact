;; Manifold Staking Pools
;; Token Staking and Rewards Distribution System
;; Version: 1.0.0

(namespace "free")

(define-keyset "free.manifold-admin" (read-keyset "manifold-admin"))

(module manifold-staking GOVERNANCE
  @doc "Manifold Staking Pools - Token Staking and Rewards System"
  
  (defcap GOVERNANCE ()
    (enforce-keyset "free.manifold-admin"))
  
  (defcap STAKE (account:string token:string amount:decimal)
    @doc "Capability for staking tokens"
    (compose-capability (DEBIT account token)))
  
  (defcap UNSTAKE (account:string token:string amount:decimal)
    @doc "Capability for unstaking tokens"
    (compose-capability (CREDIT account token)))
  
  (defcap CLAIM_REWARDS (account:string reward-token:string amount:decimal)
    @doc "Capability for claiming staking rewards"
    (compose-capability (CREDIT account reward-token)))
  
  (defcap DEBIT (account:string token:string)
    @doc "Capability for debiting tokens"
    (if (= token "KDA")
        (coin.DEBIT account)
        true)) ; For other tokens, implement token-specific debit
  
  (defcap CREDIT (account:string token:string)
    @doc "Capability for crediting tokens"
    (if (= token "KDA")
        (coin.CREDIT account)
        true)) ; For other tokens, implement token-specific credit
  
  (defcap ADD_REWARDS (pool-id:string reward-token:string amount:decimal)
    @doc "Capability for adding rewards to pool"
    (enforce-keyset "free.manifold-admin"))

  ;; Schema Definitions
  (defschema staking-pool-schema
    @doc "Staking pool configuration"
    pool-id:string
    staking-token:string
    reward-token:string
    total-staked:decimal
    reward-rate:decimal
    last-update-time:time
    reward-per-token-stored:decimal
    pool-duration:decimal
    pool-start-time:time
    pool-end-time:time
    minimum-stake:decimal
    lock-period:decimal
    early-withdraw-penalty:decimal
    active:bool)
  
  (defschema user-stake-schema
    @doc "User staking position"
    account:string
    pool-id:string
    staked-amount:decimal
    reward-per-token-paid:decimal
    rewards-earned:decimal
    rewards-claimed:decimal
    stake-time:time
    last-claim-time:time
    unlock-time:time)
  
  (defschema reward-distribution-schema
    @doc "Reward distribution event"
    pool-id:string
    reward-token:string
    amount:decimal
    duration:decimal
    start-time:time
    end-time:time
    distributor:string
    timestamp:time)
  
  (defschema stake-history-schema
    @doc "Staking history record"
    account:string
    pool-id:string
    action:string
    amount:decimal
    rewards-claimed:decimal
    timestamp:time)

  ;; Table Definitions
  (deftable staking-pools:{staking-pool-schema})
  (deftable user-stakes:{user-stake-schema})
  (deftable reward-distributions:{reward-distribution-schema})
  (deftable stake-history:{stake-history-schema})
  
  ;; Constants
  (defconst SECONDS_PER_DAY:decimal 86400.0)
  (defconst PRECISION:decimal 1000000000000000000.0) ; 18 decimals
  (defconst MAX_REWARD_RATE:decimal 1000.0) ; Max 1000 tokens per second
  (defconst MIN_POOL_DURATION:decimal 86400.0) ; Minimum 1 day

  ;; Utility Functions
  (defun create-stake-key:string (account:string pool-id:string)
    @doc "Create unique stake identifier"
    (format "{}-{}" [account pool-id]))
  
  (defun calculate-time-elapsed:decimal (start-time:time end-time:time)
    @doc "Calculate time elapsed in seconds"
    (diff-time end-time start-time))
  
  (defun calculate-reward-per-token:decimal (pool-id:string current-time:time)
    @doc "Calculate reward per token for pool"
    (with-read staking-pools pool-id
      { "total-staked" := total-staked
      , "reward-rate" := reward-rate
      , "last-update-time" := last-update-time
      , "reward-per-token-stored" := stored
      , "pool-end-time" := pool-end-time }
      
      (if (= total-staked 0.0)
          stored
          (let* ((effective-end-time (if (< current-time pool-end-time) current-time pool-end-time))
                 (time-elapsed (calculate-time-elapsed last-update-time effective-end-time))
                 (reward-increment (/ (* reward-rate time-elapsed) total-staked)))
            (+ stored reward-increment)))))
  
  (defun calculate-user-rewards:decimal (account:string pool-id:string current-time:time)
    @doc "Calculate pending rewards for user"
    (with-read user-stakes (create-stake-key account pool-id)
      { "staked-amount" := staked-amount
      , "reward-per-token-paid" := paid
      , "rewards-earned" := earned }
      
      (let ((current-reward-per-token (calculate-reward-per-token pool-id current-time)))
        (+ earned (* staked-amount (- current-reward-per-token paid))))))
  
  (defun transfer-token (from:string to:string token:string amount:decimal)
    @doc "Transfer tokens between accounts"
    (if (= token "KDA")
        (coin.transfer from to amount)
        true)) ; Implement for other token standards
  
  (defun get-token-balance:decimal (account:string token:string)
    @doc "Get token balance for account"
    (if (= token "KDA")
        (coin.get-balance account)
        0.0)) ; Implement for other token standards

  ;; Core Functions
  (defun create-staking-pool 
    (pool-id:string 
     staking-token:string 
     reward-token:string 
     reward-rate:decimal 
     pool-duration:decimal 
     minimum-stake:decimal 
     lock-period:decimal 
     early-withdraw-penalty:decimal)
    @doc "Create a new staking pool"
    (with-capability (GOVERNANCE)
      (let* ((current-time (at "block-time" (chain-data)))
             (pool-end-time (add-time current-time pool-duration)))
        
        (enforce (> reward-rate 0.0) "Reward rate must be positive")
        (enforce (<= reward-rate MAX_REWARD_RATE) "Reward rate too high")
        (enforce (>= pool-duration MIN_POOL_DURATION) "Pool duration too short")
        (enforce (>= minimum-stake 0.0) "Minimum stake cannot be negative")
        (enforce (>= lock-period 0.0) "Lock period cannot be negative")
        (enforce (>= early-withdraw-penalty 0.0) "Early withdraw penalty cannot be negative")
        (enforce (<= early-withdraw-penalty 1.0) "Early withdraw penalty cannot exceed 100%")
        
        (insert staking-pools pool-id
          { "pool-id": pool-id
          , "staking-token": staking-token
          , "reward-token": reward-token
          , "total-staked": 0.0
          , "reward-rate": reward-rate
          , "last-update-time": current-time
          , "reward-per-token-stored": 0.0
          , "pool-duration": pool-duration
          , "pool-start-time": current-time
          , "pool-end-time": pool-end-time
          , "minimum-stake": minimum-stake
          , "lock-period": lock-period
          , "early-withdraw-penalty": early-withdraw-penalty
          , "active": true })
        
        (format "Staking pool created: {} for {} rewards" [pool-id reward-token]))))
  
  (defun stake (pool-id:string amount:decimal account:string)
    @doc "Stake tokens in pool"
    (with-read staking-pools pool-id
      { "staking-token" := staking-token
      , "minimum-stake" := minimum-stake
      , "active" := active
      , "lock-period" := lock-period }
      
      (require-capability (STAKE account staking-token amount))
      
      (enforce active "Pool is not active")
      (enforce (> amount 0.0) "Stake amount must be positive")
      (enforce (>= amount minimum-stake) "Stake amount below minimum")
      
      (let* ((current-time (at "block-time" (chain-data)))
             (stake-key (create-stake-key account pool-id))
             (unlock-time (add-time current-time lock-period)))
        
        ;; Update pool reward calculations
        (update-pool-rewards pool-id current-time)
        
        ;; Update or create user stake
        (with-default-read user-stakes stake-key
          { "staked-amount": 0.0, "rewards-earned": 0.0, "rewards-claimed": 0.0 }
          { "staked-amount" := current-staked
          , "rewards-earned" := current-rewards
          , "rewards-claimed" := rewards-claimed }
          
          ;; Calculate pending rewards before updating stake
          (let* ((pending-rewards (calculate-user-rewards account pool-id current-time))
                 (new-staked (+ current-staked amount))
                 (current-reward-per-token (calculate-reward-per-token pool-id current-time)))
            
            (write user-stakes stake-key
              { "account": account
              , "pool-id": pool-id
              , "staked-amount": new-staked
              , "reward-per-token-paid": current-reward-per-token
              , "rewards-earned": pending-rewards
              , "rewards-claimed": rewards-claimed
              , "stake-time": current-time
              , "last-claim-time": current-time
              , "unlock-time": unlock-time })))
        
        ;; Update pool total staked
        (with-read staking-pools pool-id
          { "total-staked" := total-staked }
          (update staking-pools pool-id
            { "total-staked": (+ total-staked amount) }))
        
        ;; Record stake history
        (insert stake-history (format "{}-{}-{}" [account pool-id current-time])
          { "account": account
          , "pool-id": pool-id
          , "action": "STAKE"
          , "amount": amount
          , "rewards-claimed": 0.0
          , "timestamp": current-time })
        
        (format "Staked {} {} in pool {}" [amount staking-token pool-id]))))
  
  (defun unstake (pool-id:string amount:decimal account:string)
    @doc "Unstake tokens from pool"
    (with-read staking-pools pool-id
      { "staking-token" := staking-token
      , "early-withdraw-penalty" := penalty-rate }
      
      (require-capability (UNSTAKE account staking-token amount))
      
      (let* ((current-time (at "block-time" (chain-data)))
             (stake-key (create-stake-key account pool-id)))
        
        ;; Update pool reward calculations
        (update-pool-rewards pool-id current-time)
        
        (with-read user-stakes stake-key
          { "staked-amount" := staked-amount
          , "unlock-time" := unlock-time }
          
          (enforce (> amount 0.0) "Unstake amount must be positive")
          (enforce (>= staked-amount amount) "Insufficient staked amount")
          
          (let* ((is-early-withdraw (< current-time unlock-time))
                 (penalty-amount (if is-early-withdraw (* amount penalty-rate) 0.0))
                 (actual-amount (- amount penalty-amount))
                 (new-staked (- staked-amount amount))
                 (pending-rewards (calculate-user-rewards account pool-id current-time))
                 (current-reward-per-token (calculate-reward-per-token pool-id current-time)))
            
            ;; Update user stake
            (update user-stakes stake-key
              { "staked-amount": new-staked
              , "reward-per-token-paid": current-reward-per-token
              , "rewards-earned": pending-rewards })
            
            ;; Update pool total staked
            (with-read staking-pools pool-id
              { "total-staked" := total-staked }
              (update staking-pools pool-id
                { "total-staked": (- total-staked amount) }))
            
            ;; Record unstake history
            (insert stake-history (format "{}-{}-{}" [account pool-id current-time])
              { "account": account
              , "pool-id": pool-id
              , "action": "UNSTAKE"
              , "amount": actual-amount
              , "rewards-claimed": 0.0
              , "timestamp": current-time })
            
            (if is-early-withdraw
                (format "Unstaked {} {} with {} penalty from pool {}" 
                        [actual-amount staking-token penalty-amount pool-id])
                (format "Unstaked {} {} from pool {}" [amount staking-token pool-id]))))))
  
  (defun claim-rewards (pool-id:string account:string)
    @doc "Claim pending rewards"
    (with-read staking-pools pool-id
      { "reward-token" := reward-token }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (stake-key (create-stake-key account pool-id))
             (pending-rewards (calculate-user-rewards account pool-id current-time)))
        
        (require-capability (CLAIM_REWARDS account reward-token pending-rewards))
        
        (enforce (> pending-rewards 0.0) "No rewards to claim")
        
        ;; Update pool reward calculations
        (update-pool-rewards pool-id current-time)
        
        (with-read user-stakes stake-key
          { "rewards-claimed" := rewards-claimed }
          
          (let* ((current-reward-per-token (calculate-reward-per-token pool-id current-time))
                 (new-rewards-claimed (+ rewards-claimed pending-rewards)))
            
            ;; Update user stake
            (update user-stakes stake-key
              { "reward-per-token-paid": current-reward-per-token
              , "rewards-earned": 0.0
              , "rewards-claimed": new-rewards-claimed
              , "last-claim-time": current-time })
            
            ;; Record claim history
            (insert stake-history (format "{}-{}-{}" [account pool-id current-time])
              { "account": account
              , "pool-id": pool-id
              , "action": "CLAIM"
              , "amount": 0.0
              , "rewards-claimed": pending-rewards
              , "timestamp": current-time })
            
            (format "Claimed {} {} rewards from pool {}" [pending-rewards reward-token pool-id])))))
  
  (defun add-rewards (pool-id:string amount:decimal duration:decimal distributor:string)
    @doc "Add rewards to staking pool"
    (with-read staking-pools pool-id
      { "reward-token" := reward-token
      , "reward-rate" := current-rate }
      
      (require-capability (ADD_REWARDS pool-id reward-token amount))
      
      (enforce (> amount 0.0) "Reward amount must be positive")
      (enforce (> duration 0.0) "Duration must be positive")
      
      (let* ((current-time (at "block-time" (chain-data)))
             (new-rate (/ amount duration))
             (end-time (add-time current-time duration)))
        
        ;; Update pool reward calculations
        (update-pool-rewards pool-id current-time)
        
        ;; Update pool with new reward rate
        (update staking-pools pool-id
          { "reward-rate": (+ current-rate new-rate)
          , "pool-end-time": end-time })
        
        ;; Record reward distribution
        (insert reward-distributions (format "{}-{}" [pool-id current-time])
          { "pool-id": pool-id
          , "reward-token": reward-token
          , "amount": amount
          , "duration": duration
          , "start-time": current-time
          , "end-time": end-time
          , "distributor": distributor
          , "timestamp": current-time })
        
        (format "Added {} {} rewards to pool {} for {} seconds" 
                [amount reward-token pool-id duration]))))
  
  (defun update-pool-rewards (pool-id:string current-time:time)
    @doc "Update pool reward calculations"
    (let ((new-reward-per-token (calculate-reward-per-token pool-id current-time)))
      (update staking-pools pool-id
        { "reward-per-token-stored": new-reward-per-token
        , "last-update-time": current-time })))
  
  (defun emergency-pause-pool (pool-id:string)
    @doc "Emergency pause pool (admin only)"
    (with-capability (GOVERNANCE)
      (update staking-pools pool-id { "active": false })
      (format "Pool {} paused" [pool-id])))
  
  (defun resume-pool (pool-id:string)
    @doc "Resume paused pool (admin only)"
    (with-capability (GOVERNANCE)
      (update staking-pools pool-id { "active": true })
      (format "Pool {} resumed" [pool-id])))

  ;; Query Functions
  (defun get-staking-pool:object{staking-pool-schema} (pool-id:string)
    @doc "Get staking pool information"
    (read staking-pools pool-id))
  
  (defun get-user-stake:object{user-stake-schema} (account:string pool-id:string)
    @doc "Get user's stake information"
    (read user-stakes (create-stake-key account pool-id)))
  
  (defun get-pending-rewards:decimal (account:string pool-id:string)
    @doc "Get user's pending rewards"
    (calculate-user-rewards account pool-id (at "block-time" (chain-data))))
  
  (defun get-pool-apy:decimal (pool-id:string)
    @doc "Calculate annualized percentage yield"
    (with-read staking-pools pool-id
      { "reward-rate" := reward-rate
      , "total-staked" := total-staked }
      
      (if (= total-staked 0.0)
          0.0
          (let ((annual-rewards (* reward-rate (* 365.0 SECONDS_PER_DAY))))
            (* (/ annual-rewards total-staked) 100.0)))))
  
  (defun list-staking-pools:[object{staking-pool-schema}] ()
    @doc "List all staking pools"
    (map (read staking-pools) (keys staking-pools)))
  
  (defun get-user-stake-history:[object{stake-history-schema}] (account:string)
    @doc "Get user's staking history"
    (select stake-history (where "account" (= account))))
  
  (defun get-pool-distributions:[object{reward-distribution-schema}] (pool-id:string)
    @doc "Get pool's reward distribution history"
    (select reward-distributions (where "pool-id" (= pool-id))))
)

;; Initialize tables
(if (read-msg "init")
  [(create-table staking-pools)
   (create-table user-stakes)
   (create-table reward-distributions)
   (create-table stake-history)]
  [])