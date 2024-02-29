.PHONY: all omnilock anyone-can-pay

all: omnilock anyone-can-pay xudt

omnilock:
	@echo "Building omnilock via submodule"
	cd ckb/omnilock && git submodule update --init && make all-via-docker
	cp ckb/omnilock/build/always_success ckb/devnet/specs/
	cp ckb/omnilock/build/omni_lock ckb/devnet/specs/

anyone-can-pay:
	@echo "Building anyone-can-pay via submodule"
	cd ckb/anyone-can-pay && git submodule update --init && make all-via-docker
	cp ckb/anyone-can-pay/build/anyone_can_pay ckb/devnet/specs/

xudt:
	@echo "Building xUDT via submodule"
	cd ckb/ckb-production-scripts && git submodule update --init && make all-via-docker
	cp ckb/ckb-production-scripts/build/xudt_rce ckb/devnet/specs/
	cp ckb/ckb-production-scripts/build/simple_udt ckb/devnet/specs/sudt
