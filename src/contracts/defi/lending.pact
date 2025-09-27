;; Manifold Lending Protocol
;; Decentralized Lending and Borrowing Platform
;; Version: 1.0.0

(namespace "free")

(define-keyset "free.manifold-admin" (read-keyset "manifold-admin"))

(module manifold-lending GOVERNANCE
  @doc "Manifold Lending Protocol - Decentralized Lending and Borrowing"
  
  (defcap GOVERNANCE ()
    (enforce-keyset "free.manifold-admin"))
  
  (defcap SUPPLY (account:string token:string amount:decimal)
    @doc "Capability for supplying tokens to lending pool"
    (compose-capability (DEBIT account token)))
  
  (defcap WITHDRAW (account:string token:string amount:decimal)
    @doc "Capability for withdrawing supplied tokens"
    (compose-capability (CREDIT account token)))
  
  (defcap BORROW (account:string token:string amount:decimal)
    @doc "Capability for borrowing tokens"
    (compose-capability (CREDIT account token)))
  
  (defcap REPAY (account:string token:string amount:decimal)
    @doc "Capability for repaying borrowed tokens"
    (compose-capability (DEBIT account token)))
  
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
  
  (defcap LIQUIDATE (liquidator:string borrower:string collateral-token:string debt-token:string)
    @doc "Capability for liquidating undercollateralized positions"
    (compose-capability (DEBIT liquidator debt-token))
    (compose-capability (CREDIT liquidator collateral-token)))

  ;; Schema Definitions
  (defschema lending-pool-schema
    @doc "Lending pool information"
    token:string
    total-supplied:decimal
    total-borrowed:decimal
    supply-rate:decimal
    borrow-rate:decimal
    utilization-rate:decimal
    reserve-factor:decimal
    last-updated:time
    liquidation-threshold:decimal
    collateral-factor:decimal)
  
  (defschema user-position-schema
    @doc "User lending position"
    account:string
    token:string
    supplied-amount:decimal
    borrowed-amount:decimal
    collateral-value:decimal
    debt-value:decimal
    health-factor:decimal
    last-updated:time)
  
  (defschema interest-rate-schema
    @doc "Interest rate model parameters"
    token:string
    base-rate:decimal
    slope1:decimal
    slope2:decimal
    optimal-utilization:decimal
    last-updated:time)
  
  (defschema liquidation-schema
    @doc "Liquidation event record"
    liquidator:string
    borrower:string
    collateral-token:string
    debt-token:string
    collateral-amount:decimal
    debt-amount:decimal
    liquidation-bonus:decimal
    timestamp:time)

  ;; Table Definitions
  (deftable lending-pools:{lending-pool-schema})
  (deftable user-positions:{user-position-schema})
  (deftable interest-rates:{interest-rate-schema})
  (deftable liquidation-history:{liquidation-schema})
  
  ;; Constants
  (defconst MIN_HEALTH_FACTOR:decimal 1.0)
  (defconst LIQUIDATION_BONUS:decimal 0.05) ; 5% bonus for liquidators
  (defconst MAX_UTILIZATION:decimal 0.95) ; 95% max utilization
  (defconst SECONDS_PER_YEAR:decimal 31536000.0)
  (defconst PRECISION:decimal 1000000000000000000.0) ; 18 decimals

  ;; Utility Functions
  (defun create-position-key:string (account:string token:string)
    @doc "Create unique position identifier"
    (format "{}-{}" [account token]))
  
  (defun calculate-utilization-rate:decimal (total-supplied:decimal total-borrowed:decimal)
    @doc "Calculate utilization rate"
    (if (= total-supplied 0.0)
        0.0
        (/ total-borrowed total-supplied)))
  
  (defun calculate-interest-rate:decimal (utilization:decimal base-rate:decimal slope1:decimal slope2:decimal optimal-util:decimal)
    @doc "Calculate interest rate based on utilization"
    (if (<= utilization optimal-util)
        (+ base-rate (* utilization (/ slope1 optimal-util)))
        (+ base-rate slope1 (* (- utilization optimal-util) (/ slope2 (- 1.0 optimal-util))))))
  
  (defun calculate-compound-interest:decimal (principal:decimal rate:decimal time-elapsed:decimal)
    @doc "Calculate compound interest using approximation"
    (let* ((annual-rate (/ rate SECONDS_PER_YEAR))
           (compound-factor (+ 1.0 (* annual-rate time-elapsed))))
      (* principal compound-factor)))
  
  (defun calculate-health-factor:decimal (collateral-value:decimal debt-value:decimal liquidation-threshold:decimal)
    @doc "Calculate position health factor"
    (if (= debt-value 0.0)
        999999.0 ; Very high health factor for no debt
        (/ (* collateral-value liquidation-threshold) debt-value)))
  
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
  (defun initialize-lending-pool (token:string liquidation-threshold:decimal collateral-factor:decimal)
    @doc "Initialize a new lending pool"
    (with-capability (GOVERNANCE)
      (let ((current-time (at "block-time" (chain-data))))
        
        (enforce (> liquidation-threshold 0.0) "Liquidation threshold must be positive")
        (enforce (<= liquidation-threshold 1.0) "Liquidation threshold cannot exceed 100%")
        (enforce (> collateral-factor 0.0) "Collateral factor must be positive")
        (enforce (<= collateral-factor liquidation-threshold) "Collateral factor cannot exceed liquidation threshold")
        
        ;; Initialize lending pool
        (insert lending-pools token
          { "token": token
          , "total-supplied": 0.0
          , "total-borrowed": 0.0
          , "supply-rate": 0.0
          , "borrow-rate": 0.0
          , "utilization-rate": 0.0
          , "reserve-factor": 0.1
          , "last-updated": current-time
          , "liquidation-threshold": liquidation-threshold
          , "collateral-factor": collateral-factor })
        
        ;; Initialize interest rate model
        (insert interest-rates token
          { "token": token
          , "base-rate": 0.02        ; 2% base rate
          , "slope1": 0.10           ; 10% slope below optimal
          , "slope2": 3.0            ; 300% slope above optimal
          , "optimal-utilization": 0.8 ; 80% optimal utilization
          , "last-updated": current-time })
        
        (format "Lending pool initialized for token: {}" [token]))))
  
  (defun supply (token:string amount:decimal account:string)
    @doc "Supply tokens to lending pool"
    (require-capability (SUPPLY account token amount))
    
    (enforce (> amount 0.0) "Supply amount must be positive")
    
    (with-read lending-pools token
      { "total-supplied" := total-supplied
      , "total-borrowed" := total-borrowed }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (position-key (create-position-key account token))
             (new-total-supplied (+ total-supplied amount)))
        
        ;; Update lending pool
        (update lending-pools token
          { "total-supplied": new-total-supplied
          , "last-updated": current-time })
        
        ;; Update user position
        (with-default-read user-positions position-key
          { "supplied-amount": 0.0, "borrowed-amount": 0.0, "collateral-value": 0.0, "debt-value": 0.0 }
          { "supplied-amount" := current-supplied
          , "borrowed-amount" := current-borrowed
          , "collateral-value" := current-collateral
          , "debt-value" := current-debt }
          
          (let* ((new-supplied (+ current-supplied amount))
                 (new-collateral-value (+ current-collateral amount))
                 (health-factor (calculate-health-factor new-collateral-value current-debt 0.8)))
            
            (write user-positions position-key
              { "account": account
              , "token": token
              , "supplied-amount": new-supplied
              , "borrowed-amount": current-borrowed
              , "collateral-value": new-collateral-value
              , "debt-value": current-debt
              , "health-factor": health-factor
              , "last-updated": current-time })))
        
        ;; Update interest rates
        (update-pool-rates token)
        
        (format "Supplied {} {} to lending pool" [amount token]))))
  
  (defun withdraw (token:string amount:decimal account:string)
    @doc "Withdraw supplied tokens from lending pool"
    (require-capability (WITHDRAW account token amount))
    
    (enforce (> amount 0.0) "Withdraw amount must be positive")
    
    (with-read lending-pools token
      { "total-supplied" := total-supplied
      , "total-borrowed" := total-borrowed }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (position-key (create-position-key account token))
             (new-total-supplied (- total-supplied amount)))
        
        (enforce (>= new-total-supplied total-borrowed) "Insufficient liquidity")
        
        ;; Verify user has sufficient balance
        (with-read user-positions position-key
          { "supplied-amount" := supplied-amount
          , "borrowed-amount" := borrowed-amount
          , "debt-value" := debt-value }
          
          (enforce (>= supplied-amount amount) "Insufficient supplied balance")
          
          (let* ((new-supplied (- supplied-amount amount))
                 (new-collateral-value (- supplied-amount amount))
                 (health-factor (calculate-health-factor new-collateral-value debt-value 0.8)))
            
            ;; Ensure withdrawal doesn't make position unhealthy
            (if (> debt-value 0.0)
                (enforce (>= health-factor MIN_HEALTH_FACTOR) "Withdrawal would make position unhealthy")
                true)
            
            ;; Update lending pool
            (update lending-pools token
              { "total-supplied": new-total-supplied
              , "last-updated": current-time })
            
            ;; Update user position
            (update user-positions position-key
              { "supplied-amount": new-supplied
              , "collateral-value": new-collateral-value
              , "health-factor": health-factor
              , "last-updated": current-time })))
        
        ;; Update interest rates
        (update-pool-rates token)
        
        (format "Withdrew {} {} from lending pool" [amount token]))))
  
  (defun borrow (token:string amount:decimal account:string)
    @doc "Borrow tokens from lending pool"
    (require-capability (BORROW account token amount))
    
    (enforce (> amount 0.0) "Borrow amount must be positive")
    
    (with-read lending-pools token
      { "total-supplied" := total-supplied
      , "total-borrowed" := total-borrowed
      , "collateral-factor" := collateral-factor }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (position-key (create-position-key account token))
             (new-total-borrowed (+ total-borrowed amount))
             (utilization (calculate-utilization-rate total-supplied new-total-borrowed)))
        
        (enforce (<= utilization MAX_UTILIZATION) "Pool utilization too high")
        
        ;; Update user position and verify collateralization
        (with-default-read user-positions position-key
          { "supplied-amount": 0.0, "borrowed-amount": 0.0, "collateral-value": 0.0, "debt-value": 0.0 }
          { "supplied-amount" := supplied-amount
          , "borrowed-amount" := current-borrowed
          , "collateral-value" := collateral-value
          , "debt-value" := current-debt }
          
          (let* ((new-borrowed (+ current-borrowed amount))
                 (new-debt-value (+ current-debt amount))
                 (max-borrow (* collateral-value collateral-factor))
                 (health-factor (calculate-health-factor collateral-value new-debt-value 0.8)))
            
            (enforce (<= new-debt-value max-borrow) "Insufficient collateral")
            (enforce (>= health-factor MIN_HEALTH_FACTOR) "Position would be unhealthy")
            
            ;; Update lending pool
            (update lending-pools token
              { "total-borrowed": new-total-borrowed
              , "last-updated": current-time })
            
            ;; Update user position
            (write user-positions position-key
              { "account": account
              , "token": token
              , "supplied-amount": supplied-amount
              , "borrowed-amount": new-borrowed
              , "collateral-value": collateral-value
              , "debt-value": new-debt-value
              , "health-factor": health-factor
              , "last-updated": current-time })))
        
        ;; Update interest rates
        (update-pool-rates token)
        
        (format "Borrowed {} {} from lending pool" [amount token]))))
  
  (defun repay (token:string amount:decimal account:string)
    @doc "Repay borrowed tokens"
    (require-capability (REPAY account token amount))
    
    (enforce (> amount 0.0) "Repay amount must be positive")
    
    (with-read lending-pools token
      { "total-borrowed" := total-borrowed }
      
      (let* ((current-time (at "block-time" (chain-data)))
             (position-key (create-position-key account token)))
        
        ;; Update user position
        (with-read user-positions position-key
          { "borrowed-amount" := borrowed-amount
          , "collateral-value" := collateral-value
          , "debt-value" := debt-value }
          
          (let* ((actual-repay (min amount borrowed-amount))
                 (new-borrowed (- borrowed-amount actual-repay))
                 (new-debt-value (- debt-value actual-repay))
                 (new-total-borrowed (- total-borrowed actual-repay))
                 (health-factor (calculate-health-factor collateral-value new-debt-value 0.8)))
            
            ;; Update lending pool
            (update lending-pools token
              { "total-borrowed": new-total-borrowed
              , "last-updated": current-time })
            
            ;; Update user position
            (update user-positions position-key
              { "borrowed-amount": new-borrowed
              , "debt-value": new-debt-value
              , "health-factor": health-factor
              , "last-updated": current-time })
            
            ;; Update interest rates
            (update-pool-rates token)
            
            (format "Repaid {} {} to lending pool" [actual-repay token])))))
  
  (defun liquidate (borrower:string collateral-token:string debt-token:string debt-amount:decimal liquidator:string)
    @doc "Liquidate undercollateralized position"
    (require-capability (LIQUIDATE liquidator borrower collateral-token debt-token))
    
    (let* ((borrower-position-key (create-position-key borrower debt-token))
           (current-time (at "block-time" (chain-data))))
      
      ;; Verify position is liquidatable
      (with-read user-positions borrower-position-key
        { "health-factor" := health-factor
        , "borrowed-amount" := borrowed-amount
        , "debt-value" := debt-value }
        
        (enforce (< health-factor MIN_HEALTH_FACTOR) "Position is healthy")
        (enforce (>= borrowed-amount debt-amount) "Liquidation amount exceeds debt")
        
        ;; Calculate liquidation amounts
        (let* ((liquidation-bonus LIQUIDATION_BONUS)
               (collateral-amount (* debt-amount (+ 1.0 liquidation-bonus)))
               (collateral-position-key (create-position-key borrower collateral-token)))
          
          ;; Verify borrower has sufficient collateral
          (with-read user-positions collateral-position-key
            { "supplied-amount" := collateral-supplied }
            
            (enforce (>= collateral-supplied collateral-amount) "Insufficient collateral")
            
            ;; Update borrower's debt position
            (with-read user-positions borrower-position-key
              { "borrowed-amount" := current-borrowed
              , "debt-value" := current-debt-value
              , "collateral-value" := current-collateral-value }
              
              (let* ((new-borrowed (- current-borrowed debt-amount))
                     (new-debt-value (- current-debt-value debt-amount))
                     (health-factor (calculate-health-factor current-collateral-value new-debt-value 0.8)))
                
                (update user-positions borrower-position-key
                  { "borrowed-amount": new-borrowed
                  , "debt-value": new-debt-value
                  , "health-factor": health-factor
                  , "last-updated": current-time })))
            
            ;; Update borrower's collateral position
            (with-read user-positions collateral-position-key
              { "supplied-amount" := current-supplied
              , "collateral-value" := current-collateral-value }
              
              (let* ((new-supplied (- current-supplied collateral-amount))
                     (new-collateral-value (- current-collateral-value collateral-amount)))
                
                (update user-positions collateral-position-key
                  { "supplied-amount": new-supplied
                  , "collateral-value": new-collateral-value
                  , "last-updated": current-time })))
            
            ;; Record liquidation event
            (insert liquidation-history (format "{}-{}" [liquidator current-time])
              { "liquidator": liquidator
              , "borrower": borrower
              , "collateral-token": collateral-token
              , "debt-token": debt-token
              , "collateral-amount": collateral-amount
              , "debt-amount": debt-amount
              , "liquidation-bonus": liquidation-bonus
              , "timestamp": current-time })
            
            (format "Liquidated {} debt for {} collateral with {}% bonus" 
                    [debt-amount collateral-amount (* liquidation-bonus 100.0)])))))
  
  (defun update-pool-rates (token:string)
    @doc "Update pool interest rates based on utilization"
    (with-read lending-pools token
      { "total-supplied" := total-supplied
      , "total-borrowed" := total-borrowed }
      
      (with-read interest-rates token
        { "base-rate" := base-rate
        , "slope1" := slope1
        , "slope2" := slope2
        , "optimal-utilization" := optimal-util }
        
        (let* ((utilization (calculate-utilization-rate total-supplied total-borrowed))
               (borrow-rate (calculate-interest-rate utilization base-rate slope1 slope2 optimal-util))
               (supply-rate (* borrow-rate utilization 0.9))) ; 90% of borrow rate goes to suppliers
          
          (update lending-pools token
            { "utilization-rate": utilization
            , "borrow-rate": borrow-rate
            , "supply-rate": supply-rate })))))

  ;; Query Functions
  (defun get-lending-pool:object{lending-pool-schema} (token:string)
    @doc "Get lending pool information"
    (read lending-pools token))
  
  (defun get-user-position:object{user-position-schema} (account:string token:string)
    @doc "Get user's lending position"
    (read user-positions (create-position-key account token)))
  
  (defun get-pool-utilization:decimal (token:string)
    @doc "Get pool utilization rate"
    (with-read lending-pools token
      { "total-supplied" := total-supplied, "total-borrowed" := total-borrowed }
      (calculate-utilization-rate total-supplied total-borrowed)))
  
  (defun list-lending-pools:[object{lending-pool-schema}] ()
    @doc "List all lending pools"
    (map (read lending-pools) (keys lending-pools)))
  
  (defun get-user-liquidations:[object{liquidation-schema}] (account:string)
    @doc "Get user's liquidation history"
    (select liquidation-history (where "borrower" (= account))))
)

;; Initialize tables
(if (read-msg "init")
  [(create-table lending-pools)
   (create-table user-positions)
   (create-table interest-rates)
   (create-table liquidation-history)]
  [])