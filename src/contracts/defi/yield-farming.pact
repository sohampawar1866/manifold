;; Manifold Yield Farming
;; Liquidity Mining and Yield Farming Protocol
;; Version: 1.0.0

(namespace "free")

(define-keyset "free.manifold-admin" (read-keyset "manifold-admin"))

(module manifold-yield-farming GOVERNANCE
  @doc "Manifold Yield Farming - Liquidity Mining and Yield Optimization"
  
  (defcap GOVERNANCE ()
    (enforce-keyset "free.manifold-admin"))
  
  (defcap DEPOSIT (account:string lp-token:string amount:decimal)
    @doc "Capability for depositing LP tokens"
    (compose-capability (DEBIT account lp-token)))
  
  (defcap WITHDRAW (account:string lp-token:string amount:decimal)
    @doc "Capability for withdrawing LP tokens"
    (compose-capability (CREDIT account lp-token)))
  
  (defcap HARVEST (account:string reward-token:string amount:decimal)
    @doc "Capability for harvesting yield rewards"
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
  
  (defcap COMPOUND (account:string pool-id:string)
    @doc "Capability for compounding rewards"
    true)

  ;; Schema Definitions
  (defschema farm-pool-schema
    @doc "Yield farming pool configuration"
    pool-id:string
    lp-token:string
    reward-tokens:[string]
    total-deposited:decimal
    reward-rates:[decimal]
    last-reward-time:time
    accumulated-rewards-per-share:[decimal]
    pool-weight:decimal
    deposit-fee:decimal
    withdrawal-fee:decimal
    performance-fee:decimal
    lock-period:decimal
    boost-multiplier:decimal
    active:bool
    created-at:time)
  
  (defschema user-farm-schema
    @doc "User farming position"
    account:string
    pool-id:string
    deposited-amount:decimal
    reward-debt:[decimal]
    pending-rewards:[decimal]
    total-harvested:[decimal]
    boost-level:decimal
    deposit-time:time
    last-harvest-time:time
    compound-count:integer
    unlock-time:time)
  
  (defschema boost-tier-schema
    @doc "Boost tier configuration"
    tier-id:string
    min-token-balance:decimal
    boost-multiplier:decimal
    lock-requirement:decimal
    tier-name:string)
  
  (defschema harvest-history-schema
    @doc "Harvest event record"
    account:string
    pool-id:string
    reward-tokens:[string]
    reward-amounts:[decimal]
    compound:bool
    boost-applied:decimal
    timestamp:time)
  
  (defschema pool-metrics-schema
    @doc "Pool performance metrics"
    pool-id:string
    total-value-locked:decimal
    apy:decimal
    daily-rewards:decimal
    user-count:integer
    last-updated:time)

  ;; Table Definitions
  (deftable farm-pools:{farm-pool-schema})
  (deftable user-farms:{user-farm-schema})
  (deftable boost-tiers:{boost-tier-schema})
  (deftable harvest-history:{harvest-history-schema})
  (deftable pool-metrics:{pool-metrics-schema})
  
  ;; Constants
  (defconst SECONDS_PER_DAY:decimal 86400.0)
  (defconst SECONDS_PER_YEAR:decimal 31536000.0)
  (defconst PRECISION:decimal 1000000000000000000.0) ; 18 decimals
  (defconst MAX_REWARD_TOKENS:integer 5)
  (defconst MAX_PERFORMANCE_FEE:decimal 0.05) ; 5% max performance fee

  ;; Utility Functions
  (defun create-farm-key:string (account:string pool-id:string)
    @doc "Create unique farm position identifier"
    (format "{}-{}" [account pool-id]))
  
  (defun calculate-pending-rewards:[decimal] (account:string pool-id:string)
    @doc "Calculate pending rewards for user"
    (with-read farm-pools pool-id
      { "accumulated-rewards-per-share" := acc-rewards-per-share
      , "reward-tokens" := reward-tokens }
      
      (with-read user-farms (create-farm-key account pool-id)
        { "deposited-amount" := deposited-amount
        , "reward-debt" := reward-debt
        , "boost-level" := boost-level }
        
        (let ((base-rewards (map (lambda (acc-reward debt)
                                   (* deposited-amount (- acc-reward debt)))
                                 acc-rewards-per-share reward-debt)))
          ;; Apply boost multiplier
          (map (lambda (reward) (* reward boost-level)) base-rewards)))))
  
  (defun update-pool-rewards (pool-id:string current-time:time)
    @doc "Update pool accumulated rewards per share"
    (with-read farm-pools pool-id
      { "total-deposited" := total-deposited
      , "reward-rates" := reward-rates
      , "last-reward-time" := last-reward-time
      , "accumulated-rewards-per-share" := acc-rewards }
      
      (if (and (> total-deposited 0.0) (< last-reward-time current-time))
          (let* ((time-elapsed (diff-time current-time last-reward-time))
                 (reward-increments (map (lambda (rate)
                                           (/ (* rate time-elapsed) total-deposited))
                                         reward-rates))
                 (new-acc-rewards (map (lambda (acc inc) (+ acc inc))
                                       acc-rewards reward-increments)))
            
            (update farm-pools pool-id
              { "accumulated-rewards-per-share": new-acc-rewards
              , "last-reward-time": current-time }))
          true)))
  
  (defun calculate-apy:decimal (pool-id:string)
    @doc "Calculate annual percentage yield for pool"
    (with-read farm-pools pool-id
      { "reward-rates" := reward-rates
      , "total-deposited" := total-deposited }
      
      (if (= total-deposited 0.0)
          0.0
          (let* ((daily-rewards (fold (+) 0.0 (map (lambda (rate) (* rate SECONDS_PER_DAY)) reward-rates)))
                 (annual-rewards (* daily-rewards 365.0))
                 (apy (* (/ annual-rewards total-deposited) 100.0)))
            apy))))
  
  (defun get-user-boost-level:decimal (account:string)
    @doc "Calculate user's boost level based on token holdings"
    (let ((boost-tiers (keys boost-tiers)))
      (fold (lambda (acc tier-id)
              (with-read boost-tiers tier-id
                { "min-token-balance" := min-balance
                , "boost-multiplier" := multiplier }
                ;; This would check actual token balance in a real implementation
                ;; For now, return default boost of 1.0
                1.0))
            1.0 boost-tiers)))

  ;; Core Functions
  (defun create-farm-pool 
    (pool-id:string 
     lp-token:string 
     reward-tokens:[string] 
     reward-rates:[decimal] 
     pool-weight:decimal 
     deposit-fee:decimal 
     withdrawal-fee:decimal 
     performance-fee:decimal 
     lock-period:decimal)
    @doc "Create a new yield farming pool"
    (with-capability (GOVERNANCE)
      (let ((current-time (at "block-time" (chain-data))))
        
        (enforce (> (length reward-tokens) 0) "Must have at least one reward token")
        (enforce (<= (length reward-tokens) MAX_REWARD_TOKENS) "Too many reward tokens")
        (enforce (= (length reward-tokens) (length reward-rates)) "Reward tokens and rates length mismatch")
        (enforce (>= pool-weight 0.0) "Pool weight cannot be negative")
        (enforce (>= deposit-fee 0.0) "Deposit fee cannot be negative")
        (enforce (>= withdrawal-fee 0.0) "Withdrawal fee cannot be negative")
        (enforce (<= performance-fee MAX_PERFORMANCE_FEE) "Performance fee too high")
        (enforce (>= lock-period 0.0) "Lock period cannot be negative")
        
        ;; Validate all reward rates are positive
        (map (lambda (rate) (enforce (> rate 0.0) "Reward rate must be positive")) reward-rates)
        
        (insert farm-pools pool-id
          { "pool-id": pool-id
          , "lp-token": lp-token
          , "reward-tokens": reward-tokens
          , "total-deposited": 0.0
          , "reward-rates": reward-rates
          , "last-reward-time": current-time
          , "accumulated-rewards-per-share": (make-list (length reward-tokens) 0.0)
          , "pool-weight": pool-weight
          , "deposit-fee": deposit-fee
          , "withdrawal-fee": withdrawal-fee
          , "performance-fee": performance-fee
          , "lock-period": lock-period
          , "boost-multiplier": 1.0
          , "active": true
          , "created-at": current-time })
        
        ;; Initialize pool metrics
        (insert pool-metrics pool-id
          { "pool-id": pool-id
          , "total-value-locked": 0.0
          , "apy": 0.0
          , "daily-rewards": 0.0
          , "user-count": 0
          , "last-updated": current-time })
        
        (format "Farm pool created: {} for LP token {}" [pool-id lp-token]))))
  
  (defun deposit (pool-id:string amount:decimal account:string)
    @doc "Deposit LP tokens into farming pool"
    (with-read farm-pools pool-id
      { "lp-token" := lp-token
      , "deposit-fee" := deposit-fee
      , "lock-period" := lock-period
      , "active" := active }
      
      (require-capability (DEPOSIT account lp-token amount))
      
      (enforce active "Pool is not active")
      (enforce (> amount 0.0) "Deposit amount must be positive")
      
      (let* ((current-time (at "block-time" (chain-data)))
             (farm-key (create-farm-key account pool-id))
             (fee-amount (* amount deposit-fee))
             (net-amount (- amount fee-amount))
             (unlock-time (add-time current-time lock-period))
             (boost-level (get-user-boost-level account)))
        
        ;; Update pool rewards before changing user position
        (update-pool-rewards pool-id current-time)
        
        (with-read farm-pools pool-id
          { "accumulated-rewards-per-share" := acc-rewards-per-share
          , "total-deposited" := total-deposited }
          
          ;; Update or create user farm position
          (with-default-read user-farms farm-key
            { "deposited-amount": 0.0
            , "reward-debt": (make-list (length acc-rewards-per-share) 0.0)
            , "pending-rewards": (make-list (length acc-rewards-per-share) 0.0)
            , "total-harvested": (make-list (length acc-rewards-per-share) 0.0)
            , "compound-count": 0 }
            { "deposited-amount" := current-deposited
            , "reward-debt" := current-debt
            , "pending-rewards" := current-pending
            , "total-harvested" := current-harvested
            , "compound-count" := compound-count }
            
            (let* ((new-deposited (+ current-deposited net-amount))
                   (new-debt (map (lambda (acc-reward) (* new-deposited acc-reward))
                                  acc-rewards-per-share))
                   (pending-rewards (calculate-pending-rewards account pool-id)))
              
              (write user-farms farm-key
                { "account": account
                , "pool-id": pool-id
                , "deposited-amount": new-deposited
                , "reward-debt": new-debt
                , "pending-rewards": (map (lambda (current pending) (+ current pending))
                                          current-pending pending-rewards)
                , "total-harvested": current-harvested
                , "boost-level": boost-level
                , "deposit-time": current-time
                , "last-harvest-time": current-time
                , "compound-count": compound-count
                , "unlock-time": unlock-time })))
        
        ;; Update pool total deposited
        (with-read farm-pools pool-id
          { "total-deposited" := pool-total }
          (update farm-pools pool-id
            { "total-deposited": (+ pool-total net-amount) }))
        
        ;; Update pool metrics
        (update-pool-metrics pool-id)
        
        (format "Deposited {} {} into farm pool {} (fee: {})" 
                [net-amount lp-token pool-id fee-amount]))))
  
  (defun withdraw (pool-id:string amount:decimal account:string)
    @doc "Withdraw LP tokens from farming pool"
    (with-read farm-pools pool-id
      { "lp-token" := lp-token
      , "withdrawal-fee" := withdrawal-fee }
      
      (require-capability (WITHDRAW account lp-token amount))
      
      (let* ((current-time (at "block-time" (chain-data)))
             (farm-key (create-farm-key account pool-id)))
        
        ;; Update pool rewards before changing user position
        (update-pool-rewards pool-id current-time)
        
        (with-read user-farms farm-key
          { "deposited-amount" := deposited-amount
          , "unlock-time" := unlock-time }
          
          (enforce (> amount 0.0) "Withdraw amount must be positive")
          (enforce (>= deposited-amount amount) "Insufficient deposited amount")
          (enforce (>= current-time unlock-time) "Tokens are still locked")
          
          (let* ((fee-amount (* amount withdrawal-fee))
                 (net-amount (- amount fee-amount))
                 (new-deposited (- deposited-amount amount))
                 (pending-rewards (calculate-pending-rewards account pool-id)))
            
            (with-read farm-pools pool-id
              { "accumulated-rewards-per-share" := acc-rewards-per-share
              , "total-deposited" := total-deposited }
              
              ;; Update user position
              (update user-farms farm-key
                { "deposited-amount": new-deposited
                , "reward-debt": (map (lambda (acc-reward) (* new-deposited acc-reward))
                                      acc-rewards-per-share)
                , "pending-rewards": (map (lambda (current pending) (+ current pending))
                                          pending-rewards pending-rewards) })
              
              ;; Update pool total deposited
              (update farm-pools pool-id
                { "total-deposited": (- total-deposited amount) }))
            
            ;; Update pool metrics
            (update-pool-metrics pool-id)
            
            (format "Withdrew {} {} from farm pool {} (fee: {})" 
                    [net-amount lp-token pool-id fee-amount])))))
  
  (defun harvest (pool-id:string account:string)
    @doc "Harvest pending rewards from farming pool"
    (with-read farm-pools pool-id
      { "reward-tokens" := reward-tokens
      , "performance-fee" := performance-fee }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (farm-key (create-farm-key account pool-id))
             (pending-rewards (calculate-pending-rewards account pool-id)))
        
        ;; Verify there are rewards to harvest
        (enforce (> (fold (+) 0.0 pending-rewards) 0.0) "No rewards to harvest")
        
        ;; Update pool rewards
        (update-pool-rewards pool-id current-time)
        
        (with-read user-farms farm-key
          { "total-harvested" := total-harvested }
          
          (let* ((performance-fees (map (lambda (reward) (* reward performance-fee)) pending-rewards))
                 (net-rewards (map (lambda (reward fee) (- reward fee)) pending-rewards performance-fees))
                 (new-total-harvested (map (lambda (current net) (+ current net))
                                           total-harvested net-rewards)))
            
            ;; Update user position
            (with-read farm-pools pool-id
              { "accumulated-rewards-per-share" := acc-rewards-per-share }
              
              (with-read user-farms farm-key
                { "deposited-amount" := deposited-amount }
                
                (update user-farms farm-key
                  { "reward-debt": (map (lambda (acc-reward) (* deposited-amount acc-reward))
                                        acc-rewards-per-share)
                  , "pending-rewards": (make-list (length reward-tokens) 0.0)
                  , "total-harvested": new-total-harvested
                  , "last-harvest-time": current-time })))
            
            ;; Record harvest event
            (insert harvest-history (format "{}-{}-{}" [account pool-id current-time])
              { "account": account
              , "pool-id": pool-id
              , "reward-tokens": reward-tokens
              , "reward-amounts": net-rewards
              , "compound": false
              , "boost-applied": 1.0
              , "timestamp": current-time })
            
            (format "Harvested rewards: {}" [net-rewards])))))
  
  (defun compound (pool-id:string account:string)
    @doc "Compound rewards back into farming position"
    (with-capability (COMPOUND account pool-id)
      (let* ((current-time (at "block-time" (chain-data)))
             (farm-key (create-farm-key account pool-id))
             (pending-rewards (calculate-pending-rewards account pool-id)))
        
        ;; This would convert rewards to LP tokens and re-deposit
        ;; Implementation depends on having a mechanism to swap rewards for LP tokens
        
        (with-read user-farms farm-key
          { "compound-count" := compound-count }
          
          (update user-farms farm-key
            { "compound-count": (+ compound-count 1)
            , "last-harvest-time": current-time })
          
          ;; Record compound event
          (insert harvest-history (format "{}-{}-{}" [account pool-id current-time])
            { "account": account
            , "pool-id": pool-id
            , "reward-tokens": []
            , "reward-amounts": []
            , "compound": true
            , "boost-applied": 1.0
            , "timestamp": current-time })
          
          (format "Compounded rewards for pool {}" [pool-id])))))
  
  (defun update-pool-metrics (pool-id:string)
    @doc "Update pool performance metrics"
    (with-read farm-pools pool-id
      { "total-deposited" := total-deposited }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (apy (calculate-apy pool-id))
             (user-count (length (select user-farms (where "pool-id" (= pool-id))))))
        
        (update pool-metrics pool-id
          { "total-value-locked": total-deposited
          , "apy": apy
          , "user-count": user-count
          , "last-updated": current-time }))))
  
  (defun create-boost-tier (tier-id:string min-balance:decimal multiplier:decimal lock-req:decimal tier-name:string)
    @doc "Create boost tier for enhanced rewards"
    (with-capability (GOVERNANCE)
      (enforce (> multiplier 1.0) "Boost multiplier must be greater than 1.0")
      (enforce (> min-balance 0.0) "Minimum balance must be positive")
      
      (insert boost-tiers tier-id
        { "tier-id": tier-id
        , "min-token-balance": min-balance
        , "boost-multiplier": multiplier
        , "lock-requirement": lock-req
        , "tier-name": tier-name })
      
      (format "Boost tier created: {} with {}x multiplier" [tier-name multiplier])))

  ;; Query Functions
  (defun get-farm-pool:object{farm-pool-schema} (pool-id:string)
    @doc "Get farming pool information"
    (read farm-pools pool-id))
  
  (defun get-user-farm:object{user-farm-schema} (account:string pool-id:string)
    @doc "Get user's farming position"
    (read user-farms (create-farm-key account pool-id)))
  
  (defun get-pending-rewards:[decimal] (account:string pool-id:string)
    @doc "Get user's pending rewards"
    (calculate-pending-rewards account pool-id))
  
  (defun get-pool-metrics:object{pool-metrics-schema} (pool-id:string)
    @doc "Get pool performance metrics"
    (read pool-metrics pool-id))
  
  (defun list-farm-pools:[object{farm-pool-schema}] ()
    @doc "List all farming pools"
    (map (read farm-pools) (keys farm-pools)))
  
  (defun get-user-harvest-history:[object{harvest-history-schema}] (account:string)
    @doc "Get user's harvest history"
    (select harvest-history (where "account" (= account))))
  
  (defun get-boost-tiers:[object{boost-tier-schema}] ()
    @doc "Get all boost tiers"
    (map (read boost-tiers) (keys boost-tiers)))
  
  (defun get-top-pools-by-tvl:[object{pool-metrics-schema}] (limit:integer)
    @doc "Get top pools by total value locked"
    (take limit (sort (map (read pool-metrics) (keys pool-metrics))
                      (lambda (a b) (> (at "total-value-locked" a) 
                                       (at "total-value-locked" b))))))
)

;; Initialize tables
(if (read-msg "init")
  [(create-table farm-pools)
   (create-table user-farms)
   (create-table boost-tiers)
   (create-table harvest-history)
   (create-table pool-metrics)]
  [])